<?php

namespace App\Services\Verify;

use App\Services\ServiceAbstract\VerifyAbstract;
use App\Services\ServiceInterfaces\Verify\VerifyServiceInterface;

class VerifyService extends VerifyAbstract implements VerifyServiceInterface
{
    protected function generateToken(array $user, string $type) : string
    {
        if (!isset($user->id) || !isset($user->is_admin)) {
            throw new \Exception('User id and role are required to generate token');
        }
        $tokenData = [
            'user_id' => $user->id,
            'is_admin' => $user->is_admin,
            'type' => 'register',
            'expires_at' => now()->addMinutes(10)->timestamp
        ];
        return encrypt(json_encode($tokenData));
    }

    public function generateLinkVerification(array $user, string $type) : string
    {
        try {
            $FE_URL = env('APP_FE_URL');
            $token = $this->generateToken($user, $type);
            return `${FE_URL}/verify-account?token=${$token}&type=${$type}`;
        }catch (\Error $e){
            return $e->getMessage();
        }
    }
}

