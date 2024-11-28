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

    public function deleteService(int $productVariantId)
    {
        self::forceDeleteOne($productVariantId);
        return response()->json([
            'success' => true,
            'message' => 'Product variant deleted successfully'
        ], 200);
    }
}
