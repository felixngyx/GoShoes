<?php

namespace App\Services\ServiceInterfaces\ProductVariant;

interface ProductVariantServiceInterface
{
    public function getStockQuantityByProduct(int $productId);
}
