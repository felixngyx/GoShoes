<?php

namespace App\Services\Profile;

use App\Services\ServiceInterfaces\Profile\ProfileServiceInterface;
use App\Repositories\RepositoryInterfaces\UserRepositoryInterface as UserRepository;
use App\Services\ServiceInterfaces\Token\TokenServiceInterface as TokenService;
use App\Services\ServiceInterfaces\Verify\VerifyServiceInterface as VerifyService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProfileService implements ProfileServiceInterface
{
    private static $userRepository;

    private static $verifyService;

    private static $tokenService;

    public function __construct()
    {
        self::setUserRepository(app(UserRepository::class));
        self::setVerifyService(app(VerifyService::class));
        self::setTokenService(app(TokenService::class));
    }

    /**
     * @return mixed
     */
    public static function getUserRepository(): UserRepository
    {
        return self::$userRepository;
    }

    /**
     * @param mixed $userRepository
     */
    public static function setUserRepository(UserRepository $userRepository): void
    {
        self::$userRepository = $userRepository;
    }

    /**
     * @return mixed
     */
    public static function getVerifyService() : VerifyService
    {
        return self::$verifyService;
    }

    /**
     * @param mixed $verifyService
     */
    public static function setVerifyService(VerifyService $verifyService): void
    {
        self::$verifyService = $verifyService;
    }

    /**
     * @return mixed
     */
    public static function getTokenService() : TokenService
    {
        return self::$tokenService;
    }

    /**
     * @param mixed $tokenService
     */
    public static function setTokenService(TokenService $tokenService): void
    {
        self::$tokenService = $tokenService;
    }



    public function getDetail() : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $result = self::getUserRepository()->findById($user->id);
        return response()->json([
            'success' => true,
            'data' => [
                "name" => $result->name,
                "email" => $result->email,
                "phone" => $result->phone,
                "role" => $result->role,
                "bio" => $result->bio,
                "birth_date" => $result->birth_date,
                "gender" => $result->gender,
                "email_is_verified" => (bool)$result->email_verified_at,
                'avt' => $result->avt,
            ],
        ]);
    }

    public function updateDetail(array $request) : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        $data = [
            'name' => $request['name'] ?? $user->name,
            'avt' => $request['avt'] ?? $user->avt,
            'bio' => $request['bio'] ?? $user->bio,
            'birth_date' => $request['birth_date'] ?? $user->birth_date,
            'gender' => $request['gender'] ?? $user->gender
        ];
        DB::BeginTransaction();
        try {
            self::getUserRepository()->update($data, $user->id);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Update profile successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function changeDetailRequest(array $request) : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        DB::beginTransaction();
        try {
            $verificationLink = self::getVerifyService()->generateLinkVerification($user, $request['type']);

            if ($request['type'] === 'change-email') {
                Mail::to($user->email)->send(new \App\Mail\ChangeMail($verificationLink));
                DB::commit();
                return response()->json([
                    'success' => true,
                    'data' => [
                        'link' => $verificationLink,
                    ],
                    'message' => 'Email verification link sent',
                ]);
            } else if ($request['type'] === 'change-phone') {
                Mail::to($user->email)->send(new \App\Mail\ChangePhone($verificationLink));
                DB::commit();
                return response()->json([
                    'success' => true,
                    'data' => [
                        'link' => $verificationLink,
                    ],
                    'message' => 'Phone verification link sent',
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Invalid type',
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function changePhoneRequest() : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();
        try {
            $verify = self::getVerifyService()->generateLinkVerification($user, 'change-phone');
            return response()->json([
                'success' => true,
                'data' => [
                    'link' => $verify,
                ],
                'message' => 'Phone verification link sent',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function verifyChangeEmailService(array $request) : \Illuminate\Http\JsonResponse
    {
        $decoded = self::getVerifyService()->decryptTokenService($request['token']);
        if ($decoded->type !== 'change-email') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token',
            ]);
        }

        if ($decoded->expires_at < now()->timestamp) {
            return response()->json([
                'success' => false,
                'message' => 'Token is expired',
            ]);
        }
        DB::beginTransaction();
        try {

            // check if token is used
            $tokenDetail = self::getTokenService()->findDetailToken($request['token'], $decoded->user_id);
            if (!$tokenDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not found'
                ], 404);
            }

            if ($tokenDetail->is_used){
                return response()->json([
                    'success'=> false,
                    'message'=>'Token is already used'
                ], 403);
            }

            self::getUserRepository()->update([
                'email' => $request['email'],
                'email_verified_at' => now(),
            ], $decoded->user_id);

            // set token is used
            self::getTokenService()->update([
                'is_used' => true,
            ], $tokenDetail->id);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function verifyChangePhoneService(array $request) : \Illuminate\Http\JsonResponse
    {
        $decoded = self::getVerifyService()->decryptTokenService($request['token']);
        if ($decoded->type !== 'change-phone') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token',
            ]);
        }

        if ($decoded->expires_at < now()->timestamp) {
            return response()->json([
                'success' => false,
                'message' => 'Token is expired',
            ]);
        }
        DB::beginTransaction();
        try {

            // check if token is used
            $tokenDetail = self::getTokenService()->findDetailToken($request['token'], $decoded->user_id);
            if (!$tokenDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not found'
                ], 404);
            }

            if ($tokenDetail->is_used){
                return response()->json([
                    'success'=> false,
                    'message'=>'Token is already used'
                ], 403);
            }

            self::getUserRepository()->update([
                'phone' => $request['phone']
            ], $decoded->user_id);

            // set token is used
            self::getTokenService()->update([
                'is_used' => true,
            ], $tokenDetail->id);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Phone verified successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    private static function columnHiddens() : array
    {
        return [
            'id',
            'created_at',
            'updated_at',
        ];
    }

}
