<?php

namespace App\Services\Product;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VariantColor;
use App\Models\VariantSize;
use App\Repositories\RepositoryInterfaces\ProductRepositoryInterface;
use App\Services\ServiceInterfaces\Product\ProductServiceInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\ServiceInterfaces\ImageVariant\ImageVariantServiceInterface as ImageVariantService;
use App\Services\ServiceInterfaces\ProductVariant\ProductVariantServiceInterface as ProductVariantService;

class ProductService implements ProductServiceInterface
{
    protected $productRepository;

    protected static $imageVariantService;

    protected static $productVariantService;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
        self::setImageVariantService(app(ImageVariantService::class));
        self::setProductVariantService(app(ProductVariantService::class));
    }

    /**
     * @return mixed
     */
    public static function getImageVariantService(): ImageVariantService
    {
        return self::$imageVariantService;
    }

    /**
     * @param mixed $imageVariantService
     */
    public static function setImageVariantService(ImageVariantService $imageVariantService): void
    {
        self::$imageVariantService = $imageVariantService;
    }

    /**
     * @return mixed
     */
    public static function getProductVariantService() : ProductVariantService
    {
        return self::$productVariantService;
    }

    /**
     * @param mixed $productVariantService
     */
    public static function setProductVariantService(ProductVariantService $productVariantService): void
    {
        self::$productVariantService = $productVariantService;
    }

    public function listProduct(array $request) : \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->productRepository->listProduct($request, $request['page'], $request['perPage']),
        ]);
    }

    public function storeProduct($validated)
    {
        try {
            // Chuẩn bị dữ liệu sản phẩm
            $productData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'stock_quantity' => $validated['stock_quantity'],
                'promotional_price' => $validated['promotional_price'] ?? null, // Thêm null nếu không có
                'sku' =>  $validated['sku'],
                'status' => $validated['status'],
                'thumbnail' => $validated['thumbnail'],
                'hagtag' => $validated['hagtag'] ?? null,
                'brand_id' => $validated['brand_id'],
            ];

            // Tạo sản phẩm
            $product = $this->productRepository->createProduct($productData);

            // Đồng bộ categories
            $this->productRepository->syncCategories($product, $validated['category_ids']);

            // Xử lý variants nếu có
            if (isset($validated['variants']) && !empty($validated['variants'])) {
                foreach ($validated['variants'] as $variantData) {

                    $color = VariantColor::find($variantData['color_id']);
                    $size = VariantSize::find($variantData['size_id']);

                    if(!$size) {
                        return response()->json([
                            'message' => 'Không tìm thấy kích thước với ID ' . $variantData['size_id'],
                        ]);
                    }
                    if (!$color) {
                        // Nếu không tìm thấy color, trả về lỗi
                        return response()->json([
                            'message' => 'Không tìm thấy màu với ID ' . $variantData['color_id'],
                        ], 400);
                    }

                    // Chuẩn bị dữ liệu variant
                    $variantToCreate = [
                        'color_id' => $variantData['color_id'], // Sử dụng color_id từ JSON
                        'product_id' => $product->id,
                        // 'image_variant' => $variantData['image_variant'],
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

    public function createProductService(array $request) : \Illuminate\Http\JsonResponse
    {
        $productData = [
            'name' => $request['name'],
            'description' => $request['description'],
            'brand_id' => $request['brand_id'],
            'price' => $request['price'],
            'promotional_price' => $request['promotional_price'],
            'stock_quantity' => 0,
            'status' => $request['status'],
            'sku' => $request['sku'],
            'is_deleted' => $request['is_deleted'],
            'slug' => $request['slug'],
            'thumbnail' => $request['thumbnail'],
            'hagtag' => $request['hagtag'],
        ];

        DB::beginTransaction();

        try {
            $product = $this->productRepository->upsert($productData, ['name' => $request['name']]);

            $variants = self::handleCreateVariants($request['variants'], $product->id);
            return response()->json([
                'success' => true,
                'data' => [
                    'variants' => $variants,
                ],
            ]);
            $product->stock_quantity = self::getProductVariantService()->getTotalStockQuantity($product->id);;
            DB::commit();
            return response()->json([
                'success' => true,
                'data' => [
                    'product' => $product,
                    'variants' => $variants,
                ],
            ]);
        }catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Có lỗi xảy ra khi lưu sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    protected static function handleCreateVariants(array $variantData, int $productId) : array
    {
        if (!$variantData) {
            return[];
        }
        $variants = [];
        DB::beginTransaction();
        try {
            foreach ($variantData as $variant) {
                if (!isset($variant['color_id'], $variant['image'], $variant['variant_details'])) {
                    continue;
                }

                $variantData = [
                    'product_id' => $productId,
                    'color_id' => $variant['color_id'],
                    'image' => $variant['image'],
                ];

                self::getImageVariantService()->upsert($variantData, [
                    'product_id' => $productId,
                    'color_id' => (int)$variant['color_id']
                ]);

                $variantDetails = [];
                foreach ($variant['variant_details'] as $detail) {
                    $variantDetails[] = [
                        'size_id' => $detail['size_id'],
                        'quantity' => $detail['quantity'],
                        'sku' => $detail['sku'],
                    ];
                    self::getProductVariantService()->upsert([
                        'product_id' => $productId,
                        'color_id' => $variant['color_id'],
                        'size_id' => $detail['size_id'],
                        'quantity' => $detail['quantity'],
                        'sku' => $detail['sku'],
                    ], [
                        'product_id' => $productId,
                        'color_id' => $variant['color_id'],
                        'size_id' => $detail['size_id'],
                    ]);
                }
                $variantData['variant_details'] = $variantDetails;

                $variants[] = $variantData;
            }
            DB::commit();
            return $variants;
        }catch (\Exception $e) {
            DB::rollBack();
            return [
                'message' => 'Có lỗi xảy ra khi lưu sản phẩm.',
                'error' => $e->getMessage(),
            ];
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
    public function findProductWithRelationsClient(string $id)
    {
        return $this->productRepository->findProductWithRelationsClient($id);
    }
    public function deleteProduct(Product $product)
    {
        try {
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

    public function findById(int $id) : \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->productRepository->find($id),
        ]);
    }
    public function updateProduct(Product $product, $validated)
    {
        try {
            Log::info('Bắt đầu cập nhật sản phẩm', ['product_id' => $product->id]);

            // Cập nhật thông tin sản phẩm
            $productData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'sku' => $validated['sku'],
                'status' => $validated['status'],
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
                            // 'image_variant' => $variantData['image_variant'] ?? $variant->image_variant,
                        ]);
                        Log::info('Đã cập nhật variant', ['variant_id' => $variant->id]);
                    } else {
                        // Tạo variant mới
                        $this->productRepository->createProductVariant([
                            'product_id' => $product->id,
                            'color_id' => $variantData['color_id'],
                            'size_id' => $variantData['size_id'],
                            'quantity' => $variantData['quantity'],
                            // 'image_variant' => $variantData['image_variant'] ?? null,
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
                // Lấy danh sách ID hình ảnh mới
                $newImageIds = collect($validated['images'])->pluck('id')->filter()->toArray();

                // Xóa những hình ảnh không có trong danh sách mới
                $product->images()
                    ->whereNotIn('id', $newImageIds)
                    ->delete();

                foreach ($validated['images'] as $imageData) {
                    if (isset($imageData['id'])) {
                        // Cập nhật hình ảnh hiện có
                        $product->images()
                            ->where('id', $imageData['id'])
                            ->update(['image_path' => $imageData['image_path']]);
                    } else {
                        // Tạo hình ảnh mới
                        $this->productRepository->createProductImage([
                            'product_id' => $product->id,
                            'image_path' => $imageData['image_path'],
                        ]);
                    }
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

    public function checkStockProductVariant($id)
    {
        $variant = $this->productRepository->checkStockProductVariant($id);

        if (!$variant) {
            return [
                'status' => 404,
                'message' => 'Không tìm thấy biến thể'
            ];
        }

        return [
            'status' => 200,
            'data' => [
                'variant_id' => $variant->id,
                'quantity' => $variant->quantity
            ]
        ];
    }
}
