<?php

namespace App\Repositories\RepositoryInterfaces;

use App\Models\Product;
use App\Models\ProductVariant;

interface ProductRepositoryInterface
{
    public function listProduct(
        array $filters = [],
        int $page = 1,
        int $perPage = 10
    );
    public function find($id);
    public function createProduct(array $data);
    public function syncCategories(Product $product, array $categoryIds);
    public function createProductVariant(array $variantData);
    public function createProductImage(array $imageData);
    public function findProductForDeletion(string $id);
    public function findProductWithRelations(string $id);
    public function findProductWithRelationsClient(string $id);
    public function softDeleteProduct(Product $product);
    public function restoreProduct(Product $product);
    public function checkStockProductVariant($id);


}
