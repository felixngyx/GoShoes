<?php

namespace App\Repositories\RepositoryInterfaces;

interface ProductVariantRepositoryInterface
{
    public function getStockQuantityByProduct(int $productId);
}
