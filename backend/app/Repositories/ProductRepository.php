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

        // Transform main product data
        $transformedProduct = [
            'id' => $product->id,
            'name' => $product->name,
            'price' => (float) $product->price,
            'promotional_price' => (float) $product->promotional_price,
            'stock_quantity' => $product->stock_quantity,
            'sku' => $product->sku,
            'categories' => $product->categories->pluck('name')->toArray(),
            'status' => $product->status,
            'thumbnail' => $product->thumbnail,
            'images' => $product->images->pluck('id','image_path')->toArray(),
            'variants' => $product->variants->map(function ($variant) {
                return [
                    'color' => $variant->color->color,
                    'size' => (int) $variant->size->size,
                    'quantity' => $variant->quantity,
                    'image_variant' => $variant->image_variant
                ];
            })->toArray()
        ];

        // Get related products (assuming they're products in the same category)
        $relatedProducts = Product::whereHas('categories', function ($query) use ($product) {
            $query->whereIn('categories.id', $product->categories->pluck('id'));
        })
            ->where('id', '!=', $product->id)
            ->where('is_deleted', false)
            ->limit(8)
            ->get()
            ->map(function ($relatedProduct) {
                return [
                    'id' => $relatedProduct->id,
                    'name' => $relatedProduct->name,
                    'price' => (float) $relatedProduct->price,
                    'promotional_price' => (float) $relatedProduct->promotional_price,
                    'stock_quantity' => $relatedProduct->stock_quantity,
                    'categories' => $relatedProduct->categories->pluck('name')->toArray(),
                    'status' => $relatedProduct->status,
                    'thumbnail' => $relatedProduct->thumbnail,
                    'images' => $relatedProduct->images->pluck('image_path')->toArray(),
                    'variants' => $relatedProduct->variants->map(function ($variant) {
                        return [
                            'color' => $variant->color->color,
                            'size' => (int) $variant->size->size,
                            'quantity' => $variant->quantity,
                            'image_variant' => $variant->image_variant
                        ];
                    })->toArray()
                ];
            });

        return [
            'product' => $transformedProduct,
            'relatedProducts' => $relatedProducts
        ];
    }
    public function findProductWithRelationsClient(string $id){
        $product = Product::where('is_deleted', false)
            ->with(['variants.color', 'variants.size', 'images', 'categories', 'brand'])
            ->find($id);

        if (!$product) {
            return null;
        }
        $relatedProducts = Product::whereHas('categories', function ($query) use ($product) {
            $query->whereIn('categories.id', $product->categories->pluck('id'));
        })
            ->where('id', '!=', $product->id)
            ->where('is_deleted', false)
            ->limit(8)
            ->get();

        
        return [
            'product' => $product,
            'relatedProducts' => $relatedProducts
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