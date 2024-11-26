<?php

namespace App\Services\ProductVariant;

use App\Services\ServiceAbstracts\ProductVariant\ProductVariantServiceAbstract;
use App\Services\ServiceInterfaces\ProductVariant\ProductVariantServiceInterface;

class ProductVariantService extends ProductVariantServiceAbstract implements ProductVariantServiceInterface
{
    public function getStockQuantityByProduct(int $productId)
    {
        return self::getRepository()->getStockQuantityByProduct($productId);
    }
}
