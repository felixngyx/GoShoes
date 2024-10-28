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
                // Logic lưu sản phẩm và các biến thể, ảnh

                $sku = 'shope-' . 'T' . date('m') . rand(10, 99);
                $productData = [
                    'name' => $validated['name'],
                    'description' => $validated['description'],
                    'price' => $validated['price'],
                    // 'stock_quantity' => $validated['stock_quantity'],
                    'promotional_price' => $validated['promotional_price'],
                    'sku' => $sku,
                    'thumbnail' => $validated['thumbnail'],
                    'hagtag' => $validated['hagtag'],
                    'brand_id' => $validated['brand_id'],
                ];

                $product = $this->productRepository->createProduct($productData);
                $this->productRepository->syncCategories($product, $validated['category_ids']);

                foreach ($validated['variants'] as $variantData) {
                    // $color = VariantColor::firstOrCreate(['color' => $variantData['color']]);

                    $color = VariantColor::create([
                        'color' => $variantData['color'],
                        'link_image' => $variantData['link_image'] // Kết hợp vào một mảng duy nhất
                    ]);

                    $variantData['color_id'] = $color->id;
                    $variantData['product_id'] = $product->id;
                    $variantData['image_variant'] = $variantData['image_variant'];
                    $this->productRepository->createProductVariant($variantData);
                }
                
                
                if (isset($validated['images'])) {
                    foreach ($validated['images'] as $image) {
                        $this->productRepository->createProductImage([
                            'product_id' => $product->id,
                            'image_path' => $image,
                        ]);
                    }
                }

                return $product;
            } catch (\Exception $e) {
                Log::error('Error    product: ' . $e->getMessage());

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
            foreach ($product->variants as $variant) {
                if ($variant->color_id) {
                    VariantColor::destroy($variant->color_id);
                }
            }
            // Xóa các biến thể và ảnh trong database
            $product->variants()->delete();
            $product->images()->delete();

            // Xóa sản phẩm
            $this->productRepository->deleteProduct($product);

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


    public function updateProduct(Product $product, $validated)
    {
        try {
            Log::info('Id sản phẩm', ['product_id' => $product->id]);

            // Cập nhật thông tin sản phẩm
            $productData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                // 'stock_quantity' => $validated['stock_quantity'],
                'promotional_price' => $validated['promotional_price'],
                'thumbnail' => $validated['thumbnail'],
                'hagtag' => $validated['hagtag'],
                'brand_id' => $validated['brand_id'],
            ];

            Log::info('dữ liệu sản phẩm trước khi update', $productData);

            // Cập nhật sản phẩm
            $product->update($productData);
            Log::info('Thêm dữ liệu thành công', ['product_id' => $product->id]);

            // Cập nhật danh mục liên quan
            $this->productRepository->syncCategories($product, $validated['category_ids']);
            Log::info('Danh mục đã được đồng bộ hóa thành công cho sản phẩm.', ['product_id' => $product->id]);

            // Cập nhật các biến thể
            foreach ($validated['variants'] as $variantData) {
                Log::info('Dữ liệu đầu vào cho biến thể:', $variantData);
            
                // Tìm biến thể bằng `product_id`, `color_id`, và `size_id`
                $variant = ProductVariant::where('product_id', $product->id)
                ->where('color_id', $variantData['color_id'])
                ->where('size_id', $variantData['size_id'])
                ->first();
        
            
                if ($variant) {
                    Log::info('Tìm thấy biến thể thành công.', ['variant_id' => $variant->id]);
            
                    // Cập nhật nếu biến thể tồn tại
                    $variant->update([
                        'color_id' => $variantData['color_id'],
                        'size_id' => $variantData['size_id'],
                        'quantity' => $variantData['quantity'],
                        'image_variant' => $variantData['image_variant'] ?? $variant->image_variant,
                    ]);
                    Log::info('Đã cập nhật biến thể thành công.', ['variant_id' => $variant->id]);
                } else {
                    // Nếu biến thể không tồn tại, tạo mới
                    Log::info('Không tìm thấy biến thể. Tạo biến thể mới.', $variantData);
            
                    $variantData['product_id'] = $product->id;
                    $this->productRepository->createProductVariant($variantData);
                    Log::info('Đã tạo biến thể mới', $variantData);
                }
            }
        
            // Cập nhật các hình ảnh sản phẩm
            if (isset($validated['images'])) {
                Log::info('Updating product images.', ['product_id' => $product->id]);
                // Xóa các hình ảnh cũ nếu có
                // $product->images()->delete();
                Log::info('Đã xóa hình ảnh cũ cho sản phẩm.', ['product_id' => $product->id]);

                foreach ($validated['images'] as $image) {
                    $this->productRepository->createProductImage([
                        'product_id' => $product->id,
                        'image_path' => $image,
                    ]);
                    Log::info('Đã thêm hình ảnh mới.', ['product_id' => $product->id, 'image_path' => $image]);
                }
            }

            Log::info('Cập nhật sản phẩm đã hoàn tất thành công.', ['product_id' => $product->id]);

            return response()->json([
                'message' => 'Sản phẩm đã được cập nhật thành công!',
                'product' => $product,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage(), [
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
