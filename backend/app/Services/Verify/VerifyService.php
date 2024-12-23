<?php

namespace App\Services\Verify;

use App\Services\ServiceInterfaces\Token\TokenServiceInterface as TokenService;
use App\Services\ServiceAbstracts\Verify\VerifyAbstract;
use App\Services\ServiceInterfaces\Verify\VerifyServiceInterface;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class VerifyService extends VerifyAbstract implements VerifyServiceInterface
{
    private static $tokenService;

    public function __construct()
    {
        self::setTokenService(app(TokenService::class));
    }

    public static function getTokenService(): TokenService
    {
        return self::$tokenService;
    }

    public static function setTokenService(TokenService $tokenService): void
    {
        self::$tokenService = $tokenService;
    }


    // Generate token for verification
    // please check the token data after decrypting it
    // admin can not be verified
    // token will expire in 5 minutes
    protected static function encryptToken(object $user, string $type) : string
    {
        // token data
        $tokenData = [
            'user_id' => $user->id,
            'role' => $user->role,
            'type' => $type,
            'expires_at' => now()->addMinutes(5)->timestamp
        ];
        // return encrypted token
        return encrypt(json_encode($tokenData));
    }

    // Generate link for verification
    // please check the token data after decrypting it
    // admin can not be verified
    // token will expire in 5 minutes
    public static final function generateLinkVerification(object $user, string $type) : string
    {
        DB::beginTransaction();
        try {
            // generate token
            $token = self::encryptToken($user, $type);
            self::getTokenService()->create([
                'token' => $token,
                'user_id' => (int) $user->id,
                'is_used' => false
            ]);

            DB::commit();
            // return link for verification
            return env('FRONTEND_URL') . '/verify-email?token=' . $token . '&type=' . $type;
        }catch (\Error $e){
            DB::rollBack();
            return $e->getMessage();
        }
    }

    // Verify token
    // token will expire in 5 minutes
    public function verifyTokenService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            // decrypt token
           $decrypted = self::decryptToken($request['token']);

           $token = self::getTokenService()->findDetailToken($request['token'], $decrypted->user_id);

           if (!$token) {
               return response()->json([
                   'success' => false,
                   'message' => 'Token is already used'
               ], 400);
           }

              if ($token->is_used) {
                  return response()->json([
                      'success' => false,
                      'message' => 'Token is already used'
                  ], 400);
              }

            // Check if token is expired
            if (now()->timestamp > $decrypted->expires_at) {
                return response()->json(
                    [
                        'success' => false,
                        'message' => 'Token is expired'
                    ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Token is passed',
                'data' => [
                    'type' => $decrypted->type,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Token is invalid'
            ], $e->getCode());
        }
    }

    protected static function decryptToken(string $token) : object
    {
        // decrypt token
        $decrypted = Crypt::decrypt($token);
        // get token data
        return json_decode($decrypted);
    }

    public static function decryptTokenService(string $token): object
    {
        return self::decryptToken($token);
    }
}

