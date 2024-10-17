<?php

namespace App\Services\ServiceInterfaces\PasswordChangeHistory;

interface PasswordChangeHistoryServiceInterface
{
    public function findByTokenAndUserIdIsUsedService(string $token, int $userId);
}
