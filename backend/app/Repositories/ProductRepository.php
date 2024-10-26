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
        // return Product::with(['variants', 'images', 'categories' , 'brand'])->find($id);
        // Truy vấn sản phẩm cùng với các quan hệ
        $product = Product::with(['variants.color', 'variants.size', 'images', 'categories', 'brand'])->find($id);
        if (!$product) {
            return null; 
        }
        $variantDetails = $product->variants->map(function ($variant) {
            return [
                'id' => $variant->id,
                'quantity' => $variant->quantity,
                'image_variant' => $variant->image_variant, // Lấy ảnh biến thể
                'color_id' => $variant->color_id,
                'size_id' => $variant->size_id,
                'color' => $variant->color->color, // Lấy tên màu sắc
                'size' => $variant->size->size, // Lấy tên kích thước
            ];
        });
        $brandName = $product->brand ? $product->brand->name : null;
        
        $categoryNames = $product->categories->pluck('name')->toArray(); 

        return [
            'product' => $product,
            'variantDetails' => $variantDetails,
            'brandName' => $brandName,
            'categoryNames' => $categoryNames, // Lấy tên danh mục sản phẩm
        ];
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
