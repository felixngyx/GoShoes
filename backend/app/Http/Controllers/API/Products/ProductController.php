<?php

namespace App\Http\Controllers\API\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Services\Product\ProductService;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;


class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }
    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 9);
        $orderBy = $request->input('orderBy', 'id');
        $order = $request->input('order', 'asc');
        $minPrice = $request->input('minPrice');
        $maxPrice = $request->input('maxPrice');
        $maxPrice = $request->input('brand');
        $category = $request->input('category');
        $color = $request->input('color');
        $name = $request->input('name');
        $name = $request->input('name');
        $brand_name = $request->input('brand_name');
        $brand_id = $request->input('brand_id');

        // Truy vấn sản phẩm
        $query = Product::with(['variants.color', 'variants.size', 'categories', 'brand'])
            ->where('is_deleted', false);

        // Áp dụng các điều kiện lọc
        if ($minPrice) {
            $query->where('price', '>=', $minPrice);
        }

        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }
        if ($name) {

            $query->where('name', 'LIKE', '%' . $name . '%');
        }
        if ($category) {

            if (is_array($category)) {
                $query->whereHas('categories', function ($q) use ($category) {
                    $q->whereIn('id', $category);
                });
            } else {

                $query->whereHas('categories', function ($q) use ($category) {
                    $q->where('id', $category);
                });
            }
        }

        if ($color) {
            $query->whereHas('variants.color', function ($q) use ($color) {
                $q->where('color', $color);
            });
        }
        if ($brand_name) {
            $query->whereHas('brand', function ($q) use ($brand_name) {
                $q->where('name', $brand_name);
            });
        }

        if ($brand_id) {
            $query->where('brand_id', $brand_id); // Apply filter for brand_id
        }


        // Sắp xếp
        $products = $query->orderBy($orderBy, $order)
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'status' => 'success',
            'message' => 'Products retrieved successfully',
            'data' => $products,
        ]);
    }
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        // Log::info($validated);
        // $validated = $request->validated();
        $product = $this->productService->storeProduct($validated);

        return response()->json([
            'message' => 'Sản phẩm đã được thêm thành công!',
            'product' => $product
        ], 201);
    }

    public function show(string $id)
    {
        // Tìm sản phẩm theo ID
        $product = $this->productService->findProductWithRelations($id);

        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại!'], 404);
        }
        return response()->json([
            'product' => $product['product'],
            'relatedProducts' => $product['relatedProducts'],
            // 'variantDetails' => $product['variantDetails'],
            // 'brandName' => $product['brandName'],
            // 'categoryNames' => $product['categoryNames'],
        ]);
    }

    public function edit(string $id)
    {
        //
    }
    public function update(UpdateProductRequest $request, string $id)
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
}
