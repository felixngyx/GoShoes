<?php

namespace App\Services\ServiceInterfaces\Verify;
interface VerifyServiceInterface
{
    public function generateLinkVerification(array $user, string $type) : string;
}
