<?php

namespace App\Http\Controllers\API\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Services\Product\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::paginate(2);

        return response()->json([
            'message' => 'Danh sách sản phẩm',
            'product' => $products
        ], 201);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        Log::info($validated);
        // $validated = $request->validated();
        $product = $this->productService->storeProduct($validated);

        return response()->json([
            'message' => 'Sản phẩm đã được thêm thành công!',
            'product' => $product
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Tìm sản phẩm theo ID
        $product = $this->productService->findProductWithRelations($id);

        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại!'], 404);
        }

        return response()->json([
            'product' => $product,
            'categories' => $product->categories,
            'variants' => $product->variants,
            'images' => $product->images,
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    public function update(UpdateProductRequest $request, string $id)
    {


        // // Xác thực dữ liệu đầu vào
        // $validated = $request->validate([
        //     'name' => 'required|string|max:255',
        //     'description' => 'nullable|string',
        //     'price' => 'nullable|numeric',
        //     'stock_quantity' => 'required|integer|min:1',
        //     'promotional_price' => 'nullable|numeric|min:0',
        //     'status' => 'required|in:public,unpublic,hidden',
        //     'brand_id' => 'required|exists:brands,id',
        //     'sku' => 'required|string|unique:products,sku,' . $id,
        //     'hagtag' => 'nullable|string',
        //     'category_ids' => 'required|array',
        //     'category_ids.*' => 'exists:categories,id',
        //     'variants' => 'required|array',
        //     'variants.*.color_id' => 'required|exists:variant_colors,id',
        //     'variants.*.size_id' => 'required|exists:variant_sizes,id',
        //     'variants.*.quantity' => 'required|integer|min:1',
        //     'variants.*.image_variant' => 'nullable|image|mimes:jpeg,png,jpg',
        //     'images' => 'sometimes|nullable|array',
        //     'images.*' => 'image|mimes:jpeg,png,jpg'
        // ]);

        $validated = $request->validated();
        $product = $this->productService->updateProduct($id, $validated);

        return response()->json([
            'message' => 'Sản phẩm đã được cập nhật thành công!',
            'product' => $product
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
}
