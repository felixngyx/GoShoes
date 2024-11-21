<?php

namespace App\Services\ServiceInterfaces\Token;

interface TokenServiceInterface
{
    public function findByTokenAndUserIdIsUsedService(string $token, int $userId);

    public function findDetailToken(string $token, int $userId);
}
