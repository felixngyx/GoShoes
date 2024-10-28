<?php

namespace App\Repositories\RepositoryInterfaces;

interface WishlistRepositoryInterface
{
    public function findByUserIdAndProductId(int $userId, int $productId);

    public function getAllByUserId(int $userId);
}
