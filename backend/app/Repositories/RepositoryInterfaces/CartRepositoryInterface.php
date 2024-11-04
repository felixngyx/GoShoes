<?php

namespace App\Repositories\RepositoryInterfaces;

interface CartRepositoryInterface
{
    public function findByUserIdAndProductId(int $userId, int $productId);

    public function getAllByUserId(int $userId);
}
