<?php

namespace App\Repositories\RepositoryInterfaces;

interface TokenRepositoryInterface
{
    public function findByTokenAndUserIdIsUsed(string $token, int $userId);

}
