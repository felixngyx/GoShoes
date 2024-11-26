<?php

namespace App\Http\Controllers\API\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Services\ServiceInterfaces\Product\ProductServiceInterface as ProductService;
use Illuminate\Http\Request;


class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

//        public function index(Request $request)
//        {
//            $page = $request->input('page', 1);
//            $limit = $request->input('limit', 9);
//            $orderBy = $request->input('orderBy', 'id');
//            $order = $request->input('order', 'asc');
//            $minPrice = $request->input('minPrice') ? (float) $request->input('minPrice') : null;
//            $maxPrice = $request->input('maxPrice') ? (float) $request->input('maxPrice') : null;
//            $category = $request->input('category');
//            $color = $request->input('color');
//            $name = $request->input('name');
//            $brand_name = $request->input('brand_name');
//            $brand_id = $request->input('brand_id');
//
//            // Khởi tạo query với các relations cần thiết
//            $query = Product::with(['variants.color', 'variants.size', 'categories', 'brand', 'images'])
//                ->where('is_deleted', false);
//
//            // Áp dụng các điều kiện lọc
//            if (!is_null($minPrice)) {
//                $query->where('price', '>=', $minPrice);
//            }
//
//            if (!is_null($maxPrice)) {
//                $query->where('price', '<=', $maxPrice);
//            }
//
//            if ($name) {
//                $query->where('name', 'LIKE', '%' . $name . '%');
//            }
//
//            if ($category) {
//                if (is_array($category)) {
//                    $query->whereHas('categories', function ($q) use ($category) {
//                        $q->whereIn('id', $category);
//                    });
//                } else {
//                    $query->whereHas('categories', function ($q) use ($category) {
//                        $q->where('id', $category);
//                    });
//                }
//            }
//
//            if ($color) {
//                $query->whereHas('variants.color', function ($q) use ($color) {
//                    $q->where('color', $color);
//                });
//            }
//
//            if ($brand_name) {
//                $query->whereHas('brand', function ($q) use ($brand_name) {
//                    $q->where('name', $brand_name);
//                });
//            }
//
//            if ($brand_id) {
//                $query->where('brand_id', $brand_id);
//            }
//
//            // Thực hiện phân trang
//            $paginatedProducts = $query->orderBy($orderBy, $order)
//                ->paginate($limit, ['*'], 'page', $page);
//
//            // Transform dữ liệu theo format mong muốn
//            $transformedProducts = $paginatedProducts->through(function ($product) {
//                return [
//                    'id' => $product->id,
//                    'name' => $product->name,
//                    'price' => number_format((float) $product->price, 0, ',', '.'),
//                    'promotional_price' => number_format((float) $product->promotional_price, 0, ',', '.'),
//                    'stock_quantity' => $product->stock_quantity,
//                    'sku' => $product->sku,
//                    'rating_count' => $product->rating_count,
//                    'brand' => $product->brand->name,
//                    'categories' => $product->categories->pluck('name')->toArray(),
//                    'status' => $product->status,
//                    'thumbnail' => $product->thumbnail,
//                    'images' => $product->images->pluck('image_path')->toArray(),
//                    'variants' => $product->variants->map(function ($variant) {
//                        return [
//                            'id' => $variant->id,
//                            'size' => (int) $variant->size->size,
//                            'color' => $variant->color->color,
//                            'quantity' => $variant->quantity,
//                            // 'image_variant' => $variant->image_variant
//                        ];
//                    })->toArray()
//                ];
//            });
//
//            // Chuẩn bị response
//            return response()->json([
//                'status' => 'success',
//                'message' => 'Products retrieved successfully',
//                'data' => [
//                    'products' => $transformedProducts->items(),
//                    'pagination' => [
//                        'total' => $paginatedProducts->total(),
//                        'per_page' => $paginatedProducts->perPage(),
//                        'current_page' => $paginatedProducts->currentPage(),
//                        'last_page' => $paginatedProducts->lastPage(),
//                        'from' => $paginatedProducts->firstItem(),
//                        'to' => $paginatedProducts->lastItem(),
//                    ]
//                ]
//            ]);
//    }\

    public function createProduct(StoreProductRequest $request) : \Illuminate\Http\JsonResponse
    {
        return $this->productService->createProductService($request->all());
    }

    public function updateProduct(UpdateProductRequest $request, int $id) : \Illuminate\Http\JsonResponse
    {
        return $this->productService->updateProductService($request->all(), $id);
    }

    public function index(Request $request)
    {
        $filters = $request->only(['id', 'brand_id', 'name', 'price_from', 'price_to', 'status']);
        $filters['page'] = $request->get('page', 1);
        $filters['perPage'] = $request->get('per_page', 10);
        return $this->productService->listProduct($filters);
    }
    public function store(StoreProductRequest $request)
    {
        try {
            $validated = $request->validated();
            $product = $this->productService->storeProduct($validated);

            // Kiểm tra nếu product là response (tức là có lỗi)
            if ($product instanceof \Illuminate\Http\JsonResponse) {
                return $product;
            }

            return response()->json([
                'message' => 'Sản phẩm đã được thêm thành công!',
                'product' => $product
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi thêm sản phẩm.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id) : \Illuminate\Http\JsonResponse
    {
        return $this->productService->findById($id);
    }

    public function edit(string $id)
    {
        //
    }
    public function update(UpdateProductRequest $request, int $id)
    {
        // Xác thực dữ liệu đầu vào
        $validated = $request->validated();

        // Tìm sản phẩm theo ID
        $product = $this->productService->findProductForDeletion($id);

        // Kiểm tra sự tồn tại của sản phẩm
        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại!'], 404);
        }

        // Cập nhật sản phẩm
        $this->productService->updateProduct($product, $validated);

        // Lấy lại thông tin sản phẩm cùng với các quan hệ
        $product_findID = $this->productService->findProductWithRelations($id);

        // Trả về thông tin sản phẩm đã được cập nhật
        return response()->json([
            'product' => $product_findID['product'],
            // 'variantDetails' => $product_findID['variantDetails'],
            // 'brandName' => $product_findID['brandName'],
            // 'categoryNames' => $product_findID['categoryNames'],
            'message' => 'Sản phẩm đã được cập nhật thành công!',
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Tìm sản phẩm theo ID
        $product = $this->productService->findProductForDeletion($id);

        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại!'], 404);
        }

        // Xóa sản phẩm
        $this->productService->deleteProduct($product);

        return response()->json(['message' => 'Sản phẩm đã được xóa thành công!'], 200);
    }
    public function trashedProducts(Request $request)
    {
        try {
            // Lấy các tham số từ request
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 9);
            $orderBy = $request->input('orderBy', 'id');
            $order = $request->input('order', 'asc');
            $name = $request->input('name');

            // Khởi tạo query với các relationship cần thiết
            $query = Product::with(['variants.color', 'variants.size', 'categories', 'brand'])
                ->where('is_deleted', true); // Chỉ lấy sản phẩm đã xóa mềm
            if ($name) {
                $query->where('name', 'LIKE', '%' . $name . '%');
            }
            // Sắp xếp và phân trang
            $trashedProducts = $query->orderBy($orderBy, $order)
                ->paginate($limit, ['*'], 'page', $page);
            return response()->json([
                'status' => 'success',
                'message' => 'Sản phẩm thùng rác được truy xuất thành công',
                'data' => $trashedProducts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi lấy danh sách sản phẩm đã xóa.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function restore($id)
    {
        try {
            $product = Product::where('id', $id)
                ->where('is_deleted', 1)
                ->firstOrFail();

            $this->productService->restoreProduct($product);

            return response()->json([
                'status' => 'success',
                'message' => 'Sản phẩm đã được phục hồi thành công!',
                'product' => $product
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy sản phẩm hoặc sản phẩm chưa bị xóa.',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    public function restoreMultiple(Request $request)
    {
        try {
            $productIds = $request->input('product_ids', []);

            $products = Product::whereIn('id', $productIds)
                ->where('is_deleted', 1)
                ->get();

            foreach ($products as $product) {
                $this->productService->restoreProduct($product);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Khôi phục thành công ' . count($products) . ' sản phẩm.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi khôi phục sản phẩm.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkStockProductVariant($id)
    {
        return $this->productService->checkStockProductVariant($id);
    }
    public function getDetailProduct(string $id)
    {

        $product = $this->productService->findProductWithRelations($id);

        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại!'], 404);
        }

        return response()->json([
            'Data' => $product
        ]);
    }

}
