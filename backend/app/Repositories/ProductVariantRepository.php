<?php

namespace App\Repositories;

use App\Models\ProductVariant;
use App\Repositories\RepositoryInterfaces\ProductVariantRepositoryInterface;

class ProductVariantRepository extends BaseRepository implements ProductVariantRepositoryInterface
{

    public function __construct(
        ProductVariant $productVariant
    )
    {
        parent::__construct($productVariant);
    }

    public function getStockQuantityByProduct(int $productId)
    {
        return $this->model->where('product_id', $productId)->sum('stock_quantity');
    }
}
