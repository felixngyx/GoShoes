<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Repositories\RepositoryInterfaces\ProductRepositoryInterface;
use Illuminate\Support\Facades\Storage;

class ProductRepository implements ProductRepositoryInterface
{
    public function createProduct(array $data)
    {
        return Product::create($data);
    }

    public function syncCategories(Product $product, array $categoryIds)
    {
        $product->categories()->sync($categoryIds);
    }

    public function createProductVariant(array $variantData)
    {
        return ProductVariant::create($variantData);
    }

    public function createProductImage(array $imageData)
    {
        return ProductImage::create($imageData);
    }
    public function findProductForDeletion(string $id)
    {
        return Product::find($id);
    }
    public function findProductWithRelations(string $id)
    {
        return Product::with(['variants', 'images', 'categories'])->find($id);
    }
    public function deleteProduct(Product $product)

    {
        return $product->delete();
    }

    public function find($id)
    {
        return Product::findOrFail($id);
    }

}
