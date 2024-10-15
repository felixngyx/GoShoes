<?php

namespace App\Services\Verify;

use App\Services\ServiceInterfaces\PasswordChangeHistory\PasswordChangeHistoryServiceInterface as PasswordChangeHistoryService;
use App\Services\ServiceAbstracts\Verify\VerifyAbstract;
use App\Services\ServiceInterfaces\Verify\VerifyServiceInterface;
use Illuminate\Support\Facades\Crypt;

class VerifyService extends VerifyAbstract implements VerifyServiceInterface
{
    private static $passwordChangeHistoryService;

    public function __construct(
        PasswordChangeHistoryService $passwordChangeHistoryService
    )
    {
        self::setPasswordChangeHistoryService($passwordChangeHistoryService);
    }

    public static function getPasswordChangeHistoryService(): PasswordChangeHistoryService
    {
        return self::$passwordChangeHistoryService;
    }

    public static function setPasswordChangeHistoryService(PasswordChangeHistoryService $passwordChangeHistoryService): void
    {
        self::$passwordChangeHistoryService = $passwordChangeHistoryService;
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
            'is_admin' => $user->is_admin,
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
    public static function generateLinkVerification(object $user, string $type) : string
    {
        try {
            // get frontend url from .env
            $FE_URL = env('APP_FE_URL');
            // generate token
            $token = VerifyService::encryptToken($user, $type);
            self::getPasswordChangeHistoryService()->create([
                'user_id' => $user->id,
                'token' => $token,
            ]);
            // return link for verification
            return $FE_URL.'/verify-account?token='.$token.'&type='.$type;
        }catch (\Error $e){
            return $e->getMessage();
        }
    }

    // Verify token
    // token will expire in 5 minutes
    public function verifyTokenService(array $request) : \Illuminate\Http\JsonResponse
    {
        try {
            // decrypt token
           $decrypted = VerifyService::decryptToken($request['token']);

           $checkTokenIsUsed = self::getPasswordChangeHistoryService()->findByTokenAndUserIdIsUsedService($request['token'], $decrypted->user_id);

           if ($checkTokenIsUsed) {
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

            // Check if user is admin
            if ($decrypted->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin cannot be verified'
                ], 403);
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

