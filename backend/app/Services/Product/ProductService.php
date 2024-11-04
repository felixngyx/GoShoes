<?php

namespace App\Services\Product;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VariantColor;
use App\Repositories\RepositoryInterfaces\ProductRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    protected $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function storeProduct($validated)
    {
        try {
            // Tạo SKU
            $sku = 'shope-' . 'T' . date('m') . rand(10, 99);
            
            // Chuẩn bị dữ liệu sản phẩm
            $productData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'stock_quantity' => $validated['stock_quantity'],
                'promotional_price' => $validated['promotional_price'] ?? null, // Thêm null nếu không có
                'sku' => $sku,
                'thumbnail' => $validated['thumbnail'],
                'hagtag' => $validated['hagtag'] ?? null, // Thêm null nếu không có
                'brand_id' => $validated['brand_id'],
            ];
    
            // Tạo sản phẩm
            $product = $this->productRepository->createProduct($productData);
            
            // Đồng bộ categories
            $this->productRepository->syncCategories($product, $validated['category_ids']);
    
            // Xử lý variants nếu có
            if (isset($validated['variants']) && !empty($validated['variants'])) {
                foreach ($validated['variants'] as $variantData) {
                    // Tạo màu mới
                    $color = VariantColor::create([
                        'color' => $variantData['color'],
                        'link_image' => $variantData['link_image']
                    ]);
    
                    // Chuẩn bị dữ liệu variant
                    $variantToCreate = [
                        'color_id' => $color->id,
                        'product_id' => $product->id,
                        'image_variant' => $variantData['image_variant'],
                        'size_id' => $variantData['size_id'],
                        'quantity' => $variantData['quantity']
                    ];
                    
                    $this->productRepository->createProductVariant($variantToCreate);
                }
            }
    
            // Xử lý ảnh phụ nếu có
            if (isset($validated['images']) && !empty($validated['images'])) {
                foreach ($validated['images'] as $image) {
                    $this->productRepository->createProductImage([
                        'product_id' => $product->id,
                        'image_path' => $image,
                    ]);
                }
            }
    
            // Load relationships và trả về sản phẩm
            return $product->load(['categories', 'variants.color', 'variants.size', 'images', 'brand']);
    
        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Có lỗi xảy ra khi lưu sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function findProductForDeletion(string $id)
    {
        return $this->productRepository->findProductForDeletion($id);
    }

    // chi tiết sản phẩm có 
    public function findProductWithRelations(string $id)
    {
        return $this->productRepository->findProductWithRelations($id);
    }
    public function deleteProduct(Product $product)
    {
        try {
            // foreach ($product->variants as $variant) {
            //     if ($variant->color_id) {
            //         VariantColor::destroy($variant->color_id);
            //     }
            // }
            // // Xóa các biến thể và ảnh trong database
            // $product->variants()->delete();
            // $product->images()->delete();

            // Xóa sản phẩm
            $this->productRepository->softDeleteProduct($product);

            return response()->json([
                'message' => 'Sản phẩm đã được xóa thành công!',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function restoreProduct(Product $product)
    {
        try {
            $this->productRepository->restoreProduct($product);

            return response()->json([
                'message' => 'Sản phẩm đã được khôi phục thành công!',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error restoring product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Có lỗi xảy ra khi khôi phục sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    


    public function updateProduct(Product $product, $validated)
    {
        try {
            Log::info('Bắt đầu cập nhật sản phẩm', ['product_id' => $product->id]);
    
            // Cập nhật thông tin sản phẩm
            $productData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'stock_quantity' => $validated['stock_quantity'],
                'promotional_price' => $validated['promotional_price'] ?? null,
                'thumbnail' => $validated['thumbnail'],
                'hagtag' => $validated['hagtag'] ?? null,
                'brand_id' => $validated['brand_id'],
            ];
    
            // Cập nhật sản phẩm
            $product->update($productData);
            Log::info('Đã cập nhật thông tin cơ bản của sản phẩm', ['product_id' => $product->id]);
    
            // Cập nhật danh mục
            $this->productRepository->syncCategories($product, $validated['category_ids']);
            Log::info('Đã cập nhật danh mục', ['product_id' => $product->id]);
    
            // Xử lý variants
            if (isset($validated['variants']) && !empty($validated['variants'])) {
                Log::info('Bắt đầu cập nhật variants', ['product_id' => $product->id]);
                
                // Lấy danh sách variant hiện tại
                $existingVariants = $product->variants()
                    ->get()
                    ->keyBy(function ($variant) {
                        return $variant->color_id . '-' . $variant->size_id;
                    });
    
                // Tạo danh sách variant mới từ dữ liệu đầu vào
                $newVariantKeys = collect($validated['variants'])->map(function ($variant) {
                    return $variant['color_id'] . '-' . $variant['size_id'];
                })->toArray();
    
                // Xóa các variant không còn trong danh sách mới
                foreach ($existingVariants as $key => $variant) {
                    if (!in_array($key, $newVariantKeys)) {
                        $variant->delete();
                        Log::info('Đã xóa variant cũ', ['variant_id' => $variant->id]);
                    }
                }
    
                // Cập nhật hoặc tạo mới variants
                foreach ($validated['variants'] as $variantData) {
                    $variant = $product->variants()
                        ->where('color_id', $variantData['color_id'])
                        ->where('size_id', $variantData['size_id'])
                        ->first();
    
                    if ($variant) {
                        // Cập nhật variant hiện có
                        $variant->update([
                            'quantity' => $variantData['quantity'],
                            'image_variant' => $variantData['image_variant'] ?? $variant->image_variant,
                        ]);
                        Log::info('Đã cập nhật variant', ['variant_id' => $variant->id]);
                    } else {
                        // Tạo variant mới
                        $this->productRepository->createProductVariant([
                            'product_id' => $product->id,
                            'color_id' => $variantData['color_id'],
                            'size_id' => $variantData['size_id'],
                            'quantity' => $variantData['quantity'],
                            'image_variant' => $variantData['image_variant'] ?? null,
                        ]);
                        Log::info('Đã tạo variant mới');
                    }
                }
            } else {
                // Nếu không có variants trong dữ liệu cập nhật, xóa tất cả variants hiện có
                $product->variants()->delete();
                Log::info('Đã xóa tất cả variants do không có trong dữ liệu cập nhật', ['product_id' => $product->id]);
            }
    
            // Cập nhật hình ảnh
            if (isset($validated['images'])) {
                // Xóa ảnh cũ nếu cần
                // $product->images()->delete();
                
                foreach ($validated['images'] as $image) {
                    $this->productRepository->createProductImage([
                        'product_id' => $product->id,
                        'image_path' => $image,
                    ]);
                }
                Log::info('Đã cập nhật hình ảnh sản phẩm', ['product_id' => $product->id]);
            }
    
            // Load relationships và trả về
            $updatedProduct = $product->load(['categories', 'variants.color', 'variants.size', 'images', 'brand']);
    
            return response()->json([
                'message' => 'Sản phẩm đã được cập nhật thành công!',
                'product' => $updatedProduct,
            ], 200);
    
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật sản phẩm: ' . $e->getMessage(), [
                'product_id' => $product->id,
                'validated_data' => $validated,
            ]);
    
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    // protected function updateImages($product, $images)
    // {
    //     // Kiểm tra nếu có ảnh mới được cung cấp
    //     if ($images && is_array($images)) {
    //         // Xóa ảnh cũ nếu có
    //         $product->images()->each(function ($image) {
    //             Storage::disk('public')->delete($image->image_path);
    //             $image->delete();
    //         });

    //         // Lưu ảnh mới
    //         foreach ($images as $image) {
    //             if ($image) {
    //                 $imagePath = $image->store('product_images', 'public');
    //                 $product->images()->create(['image_path' => $imagePath]);
    //             }
    //         }
    //     }
    // }
}
