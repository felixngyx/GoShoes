<?php

namespace App\Services\ServiceInterfaces\Verify;
interface VerifyServiceInterface
{
    public static function generateLinkVerification(object $user, string $type) : string;

    public function verifyTokenService(array $request) : \Illuminate\Http\JsonResponse;
}
