<?php

namespace App\Services\Auth;
use App\Services\ServiceInterfaces\Token\TokenServiceInterface as TokenService;
use App\Services\ServiceInterfaces\Auth\AuthServiceInterface;
use App\Services\ServiceInterfaces\User\UserServiceInterface as UserService;
use App\Services\ServiceInterfaces\Verify\VerifyServiceInterface as VerifyService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService implements AuthServiceInterface
{
    private $userService;

    private static $verifyService;

    private static $tokenService;

    public function __construct(
        UserService $userService
    )
    {
        $this->userService = $userService;
        self::setTokenService(app(TokenService::class));
        self::setVerifyService(app(VerifyService::class));
    }

    public static function getVerifyService(): VerifyService
    {
        return self::$verifyService;
    }

    public static function setVerifyService(VerifyService $verifyService): void
    {
        self::$verifyService = $verifyService;
    }

    public static function getTokenService(): TokenService
    {
        return self::$tokenService;
    }

    public static function setTokenService(TokenService $tokenService): void
    {
        self::$tokenService = $tokenService;
    }


    public function loginService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            $data = [
                'email' => $request['email'],
                'password' => $request['password']
            ];

            if (!auth('api')->attempt($data)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid login details'
                ], 401);
            }

            $user = auth('api')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if ($user->is_deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is deleted'
                ], 403);
            }

//            if (!$user->email_verified_at) {
//                return response()->json([
//                    'success' => false,
//                    'message' => 'Email not verified'
//                ], 403);
//            }

            // Set access token TTL to 30 minutes
            config(['jwt.ttl' => 30]);
            // Add token type "access" to the access token
            $accessToken = JWTAuth::claims(['token_type' => 'access'])->fromUser($user);

            // Set refresh token TTL to 30 days
            config(['jwt.refresh_ttl' => 30 * 24 * 60]);
            // Add token type "refresh" to the refresh token
            $refreshToken = JWTAuth::claims(['token_type' => 'refresh'])->fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập thành công!',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_is_verified' => (bool)$user->email_verified_at,
                    'role' => $user->role
                ],
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'Bearer'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function logoutService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            auth()->user()->tokens()->delete();
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function registerService(array $request) : \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $user =  $this->userService->create($request);
            $verificationLink = self::getVerifyService()->generateLinkVerification($user, 'register');
            DB::commit();
            Mail::to($user->email)->send(new \App\Mail\RegisterMail($verificationLink));

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => [
                    'user' => $user->name,
                    'email' => $user->email,
                    'verification_link' => $verificationLink
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('ERROR: Register user error by'.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }

    public function sendResetPasswordRequestService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            // Check if email exists
            $user = $this->userService->findByEmail($request['email']);

            // If email not found
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email not found'
                ], 404);
            }

            // Generate verification link
            $verificationLink = (self::getVerifyService()->generateLinkVerification($user, 'reset-password'));

            // Send email
            Mail::to($user->email)->send(new \App\Mail\ResetPasswordMail($verificationLink));

            // Return response
            return response()->json([
                'success' => true,
                'message' => 'Reset password link sent to your email',
                'data' => [
                    'verification_link' => $verificationLink,
                    'email' => $user->email
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function sendEmailVerifyService() : \Illuminate\Http\JsonResponse
    {
        $user = JWTAuth::parsetoken()->authenticate();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified'
            ], 403);
        }
        DB::beginTransaction();
        try {
            $verificationLink = self::getVerifyService()->generateLinkVerification($user, 'register');
            Mail::to($user->email)->send(new \App\Mail\RegisterMail($verificationLink));
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Verification link sent to your email',
                'data' => [
                    'email' => $user->email
                ]
            ], 200);
        }catch (\Exception $e){
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function resetPasswordService(array $request) : \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $decrypted = self::getVerifyService()->decryptTokenService($request['token']);

            // Check if token is expired
            if (now()->timestamp > $decrypted->expires_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token is expired'
                ], 400);
            }

            if ($decrypted->type !== 'reset-password') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], 400);
            }

            // Check if email exists
            $user = $this->userService->findById($decrypted->user_id);

            // If email not found
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email not found'
                ], 404);
            }

            $tokenIsUsed = self::getTokenService()->findDetailToken($request['token'], $decrypted->user_id);

            if (!$tokenIsUsed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not found'
                ], 404);
            }

            if ($tokenIsUsed->is_used){
                return response()->json([
                    'success'=> false,
                    'message'=>'Token is already used'
                ], 403);
            }

            // Update password
            $user->password = bcrypt($request['password']);
            $this->userService->update(['password' => $user->password], $user->id);
            self::getTokenService()->update(['is_used' => true], $tokenIsUsed->id);
            DB::commit();
            // Return response
            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    public function registerVerifyService(array $request) : \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $decrypted = self::getVerifyService()->decryptTokenService($request['token']);

            // Check if token is expired
            if (now()->timestamp > $decrypted->expires_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token is expired'
                ], 400);
            }

            if ($decrypted->type !== 'register') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token'
                ], 400);
            }

            // Check if email exists
            $user = $this->userService->findById($decrypted->user_id);

            // If email not found
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email not found'
                ], 404);
            }

            $tokenIsUsed = self::getTokenService()->findDetailToken($request['token'], $decrypted->user_id);

            if (!$tokenIsUsed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not found'
                ], 404);
            }

            if ($tokenIsUsed->is_used){
                return response()->json([
                    'success'=> false,
                    'message'=>'Token is already used'
                ], 403);
            }

            // Update token is_used
            self::getTokenService()->update(['is_used' => true], $tokenIsUsed->id);
            // Update email_verified_at
            $this->userService->update(['email_verified_at' => now()], $user->id);
            DB::commit();
            // Return response
            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function refreshTokenService() : \Illuminate\Http\JsonResponse
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if ($user->is_deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is deleted'
                ], 403);
            }

            $accessToken = JWTAuth::claims(['token_type' => 'access'])->fromUser($user);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid refresh token'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'message' => 'Access token refreshed successfully',
                'access_token' => $accessToken,
                'token_type' => 'Bearer'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode());
        }
    }
}
