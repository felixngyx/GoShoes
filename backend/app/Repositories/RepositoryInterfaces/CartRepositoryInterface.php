<?php

namespace App\Repositories\RepositoryInterfaces;

interface CartRepositoryInterface
{
    public function findByUserIdAndProductVariantId(int $userId, int $productVariantId);

    public function getAllByUserId(int $userId);
}
