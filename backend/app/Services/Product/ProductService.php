<?php

namespace App\Services\Product;

use App\Models\Product;
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
            $thumbnailPath = null;
            if (isset($validated['thumbnail'])) {
                $thumbnail = $validated['thumbnail'];
                $thumbnailName = time() . '_' . $thumbnail->getClientOriginalName();
                $thumbnailPath = $thumbnail->storeAs('products', $thumbnailName, 'public');
            }
            $sku = 'shope-' . 'T' . date('m') . rand(10, 99);
            $productData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'stock_quantity' => $validated['stock_quantity'],
                'promotional_price' => $validated['promotional_price'],
                'sku' => $sku,
                'thumbnail' => $thumbnailPath,
                'hagtag' => $validated['hagtag'],
                'brand_id' => $validated['brand_id'],
            ];

            $product = $this->productRepository->createProduct($productData);
            $this->productRepository->syncCategories($product, $validated['category_ids']);

            foreach ($validated['variants'] as $variantData) {
                $variantData['product_id'] = $product->id;
                $imagePath = $variantData['image_variant']->store('product_variants', 'public');
                $variantData['image_variant'] = $imagePath;
                $this->productRepository->createProductVariant($variantData);
            }

            if (isset($validated['images'])) {
                foreach ($validated['images'] as $image) {
                    $imagePath = $image->store('product_images', 'public');
                    $this->productRepository->createProductImage([
                        'product_id' => $product->id,
                        'image_path' => $imagePath,
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

    public function findProductWithRelations(string $id)
    {
        return $this->productRepository->findProductWithRelations($id);
    }
    public function deleteProduct(Product $product)
    {
        try {

            $product->variants()->delete();
            $product->images()->delete();


            $this->productRepository->deleteProduct($product);

            return response()->json([
                'message' => 'Sản phẩm đã được xóa thành công!',
            ], 200);
        } catch (\Exception $e) {
            // Ghi log lỗi và trả về thông báo lỗi
            Log::error('Error deleting product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function updateProduct($id, $data)
    {
        $product = $this->productRepository->find($id);

        // Cập nhật thumbnail nếu có
        if (isset($data['thumbnail'])) {
            // Xóa thumbnail cũ nếu tồn tại
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }
            $thumbnail = $data['thumbnail'];
            $thumbnailName = time() . '_' . $thumbnail->getClientOriginalName();
            $product->thumbnail = $thumbnail->storeAs('products', $thumbnailName, 'public');
        }

        // Cập nhật các trường khác của sản phẩm
        $product->update([
            'name' => $validated['name'] ?? $product->name,
            'description' => $validated['description'] ?? $product->description,
            'price' => $validated['price'] ?? $product->price,
            'stock_quantity' => $validated['stock_quantity'] ?? $product->stock_quantity,
            'promotional_price' => $validated['promotional_price'] ?? $product->promotional_price,
            'status' => $validated['status'] ?? $product->status,
            'brand_id' => $validated['brand_id'] ?? $product->brand_id,
            'sku' => $validated['sku'] ?? $product->sku,
            'hagtag' => $validated['hagtag'] ?? $product->hagtag,
        ]);

        // Cập nhật danh mục sản phẩm
        $product->categories()->sync($data['category_ids']);

        // Cập nhật hoặc tạo mới các biến thể sản phẩm
        $this->updateVariants($product, $data['variants']);

        // Cập nhật ảnh sản phẩm nếu có
        if (isset($data['images'])) { // Thêm kiểm tra này
            $this->updateImages($product, $data['images']);
        }
        return $product; // Hoặc thông tin khác tùy nhu cầu
    }

    protected function updateVariants($product, $variants)
    {
        foreach ($variants as $key => $variantData) {
            $variant = $product->variants()->where('color_id', $variantData['color_id'])
                ->where('size_id', $variantData['size_id'])
                ->first();

            if ($variant) {
                if (isset($variantData['image_variant'])) {
                    // Xóa ảnh cũ nếu có
                    if ($variant->image_variant) {
                        Storage::disk('public')->delete($variant->image_variant);
                    }
                    // Upload ảnh mới
                    $variant->image_variant = $variantData['image_variant']->store('product_variants', 'public');
                }

                // Cập nhật biến thể
                $variant->update(['quantity' => $variantData['quantity']]);
            } else {
                // Tạo biến thể mới nếu chưa tồn tại
                $imagePath = isset($variantData['image_variant']) ?
                    $variantData['image_variant']->store('product_variants', 'public') : null;

                $product->variants()->create([
                    'color_id' => $variantData['color_id'],
                    'size_id' => $variantData['size_id'],
                    'quantity' => $variantData['quantity'],
                    'image_variant' => $imagePath,
                ]);
            }
        }
    }

    protected function updateImages($product, $images)
    {
        // Kiểm tra nếu có ảnh mới được cung cấp
        if ($images && is_array($images)) {
            // Xóa ảnh cũ nếu có
            $product->images()->each(function ($image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            });

            // Lưu ảnh mới
            foreach ($images as $image) {
                if ($image) {
                    $imagePath = $image->store('product_images', 'public');
                    $product->images()->create(['image_path' => $imagePath]);
                }
            }
        }
    }
}
