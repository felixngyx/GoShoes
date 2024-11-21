<?php

namespace App\Repositories\RepositoryInterfaces;

interface TokenRepositoryInterface
{
    public function findByTokenAndUserIdIsUsed(string $token, int $userId);

    public function findDetailToken(string $token, int $userId);

}
