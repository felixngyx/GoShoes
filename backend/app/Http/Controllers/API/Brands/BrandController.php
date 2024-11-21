<?php

namespace App\Http\Controllers\API\Brands;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Models\Brand;
use App\Services\Brand\BrandService;
use Illuminate\Http\Request;

class BrandController extends Controller
{

    protected $brandService;
    public function __construct(BrandService $brandService)
    {
        $this->brandService = $brandService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $page = $request->input('page', 1);
        $limit = $request->input('limit', 9);
        $orderBy = $request->input('orderBy', 'id');
        $order = $request->input('order', 'asc');

        $query = Brand::query();
        $brand = $query->orderBy($orderBy, $order)
            ->paginate($limit, ['*'], 'page', $page);
        return response()->json([
            'message' => 'Danh sách sizes',
            'brands' => $brand
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //    $validated = $request->validated();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBrandRequest $request)
    {
        $validated = $request->validated();
        $brand = $this->brandService->storeBrand($validated);

        return response()->json([
            'message' => 'Thương hiệu đã được thêm thành công!',
            'brand' => $brand
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $brand = $this->brandService->findBrandId($id);

        if (!$brand) {
            return response()->json([
                'message' => 'Thương hiệu không tồn tại',
            ], 404);
        }

        return response()->json([
            'message' => 'Thông tin thương hiệu',
            'brand' => $brand
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }
    public function update(Request $request, string $id)
    {
        $brand = $this->brandService->findBrandId($id);

        if (!$brand) {
            return response()->json([
                'message' => 'Thương hiệu không tồn tại',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $id,
            'description' => 'nullable|string|max:255',
            'logo_url' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);
        $brand = $this->brandService->updateBrand($id, $validated);


        return response()->json([
            'message' => 'Thông tin thương hiệu đã được cập nhật thành công!',
            'brand' => $brand
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Tìm sản phẩm theo ID
        $brand = $this->brandService->findBrandId($id);

        if (!$brand) {
            return response()->json(['message' => 'Thương hiệu không tồn tại!'], 404);
        }

        // Xóa Thương hiệu
        $this->brandService->deleteBrand($brand);

        return response()->json(['message' => 'Thương hiệu đã được xóa thành công!'], 200);
    }
    public function destroyMultiple(Request $request)
    {
        $ids = $request->input('ids');
        return $this->brandService->deleteBrands($ids);
    }
}
