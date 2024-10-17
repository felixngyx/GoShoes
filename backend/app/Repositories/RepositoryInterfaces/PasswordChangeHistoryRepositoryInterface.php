<?php

namespace App\Repositories\RepositoryInterfaces;

interface PasswordChangeHistoryRepositoryInterface
{
    public function findByTokenAndUserIdIsUsed(string $token, int $userId);

}
