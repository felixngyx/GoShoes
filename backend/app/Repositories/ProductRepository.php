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
        $product = Product::where('is_deleted', false)
            ->with(['variants.color', 'variants.size', 'images', 'categories', 'brand'])
            ->find($id);
            
        if (!$product) {
            return null;
        }
    
        $categories = $product->categories;
        $relatedProducts = Product::whereHas('categories', function ($query) use ($categories) {
            $query->whereIn('categories.id', $categories->pluck('id'));
        })
            ->where('id', '!=', $product->id)
            ->where('is_deleted', false)  // Chỉ lấy sản phẩm liên quan chưa bị xóa
            ->get();
            
        return [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ];
    }
   
    public function softDeleteProduct(Product $product)
    {
        return $product->update(['is_deleted' => 1]);
    }
    public function restoreProduct(Product $product)
    {
        return $product->update(['is_deleted' => 0]);
    }

     public function find($id)
    {
        return Product::where('is_deleted', false)->findOrFail($id);
    }
}

    // $variantDetails = $product->variants->map(function ($variant) {
        //     return [
        //         'id' => $variant->id,
        //         'quantity' => $variant->quantity,
        //         'image_variant' => $variant->image_variant, // Lấy ảnh biến thể
        //         'color_id' => $variant->color_id,
        //         'size_id' => $variant->size_id,
        //         'colorDetails' => $variant->color, // Lấy tên màu sắc
        //         'size' => $variant->size, // Lấy tên kích thước
        //     ];
        // });
        // $brandName = $product->brand ? $product->brand->name : null;
        
        // $categoryNames = $product->categories->pluck('name')->toArray(); 
   // 'variantDetails' => $variantDetails,
            // 'brandName' => $brandName,
            // 'categoryNames' => $categoryNames, // Lấy tên danh mục sản phẩm
               // return Product::with(['variants', 'images', 'categories' , 'brand'])->find($id);
        // Truy vấn sản phẩm cùng với các quan hệ