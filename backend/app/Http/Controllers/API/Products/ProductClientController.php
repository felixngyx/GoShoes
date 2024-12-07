<?php

namespace App\Http\Controllers\API\Products;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Services\Product\ProductService;

class ProductClientController extends Controller
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
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = $this->productService->findProductWithRelationsClient($id);

        if (!$product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại!'], 404);
        }

        return response()->json([
            'product' => $product

        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function HomeCustom(){
        $newProducts = Product::with(['images', 'categories'])
            ->where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        $discountProducts = Product::with(['images', 'categories'])
            ->where('is_deleted', 0)
            ->whereNotNull('promotional_price')
            ->orderByRaw('(price - promotional_price) DESC')
            ->take(8)
            ->get()
            ->map(function ($product) {
                $product->discount_percentage = round(
                    (($product->price - $product->promotional_price) / $product->price * 100)
                );
                return $product;
            });

        return response()->json([
            'newProducts' => $newProducts,
            'discountProducts' => $discountProducts
        ]);
    }
}
