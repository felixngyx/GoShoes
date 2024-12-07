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
        try{

        $page = $request->input('page', 1);
        $limit = $request->input('limit', null);
        $orderBy = $request->input('orderBy', 'id');
        $order = $request->input('order', 'asc');

        $query = Brand::withCount('products')
                         ->withAvg('products', 'rating_count')  // Tính trung bình rating_count
                         ->with(['products' => function($query) {
                             $query->where('is_deleted', false);  // Chỉ lấy sản phẩm chưa bị xóa
                         }]);// Thêm tổng số lượng tồn kho nếu cần
        $brands = $query->orderBy($orderBy, $order)
            ->paginate($limit, ['*'], 'page', $page);


            $transformedBrands = $brands->through(function($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,
                    'logo_url' => $brand->logo_url,
                    'created_at' => $brand->created_at,
                    'updated_at' => $brand->updated_at,
                    'products_count' => $brand->products_count,
                    'average_rating' => number_format($brand->products_avg_rating_count, 1) // Định dạng 1 số sau dấu phẩy
                ];
            });
            return response()->json([
                'status' => 'success',
                'message' => 'Danh sách thương hiệu',
                'data' => [
                    'brands' => $transformedBrands->items(),
                    'pagination' => [
                        'total' => $brands->total(),
                        'per_page' => $brands->perPage(),
                        'current_page' => $brands->currentPage(),
                        'last_page' => $brands->lastPage(),
                        'from' => $brands->firstItem(),
                        'to' => $brands->lastItem()
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi lấy danh sách thương hiệu: ' . $e->getMessage()
            ], 500);
        }
    }

    // public function index(Request $request)
    // {

    //     $page = $request->input('page', 1);
    //     $limit = $request->input('limit', null);
    //     $orderBy = $request->input('orderBy', 'id');
    //     $order = $request->input('order', 'asc');

    //     $query = Brand::query();
    //     $brand = $query->orderBy($orderBy, $order)
    //         ->paginate($limit, ['*'], 'page', $page);
    //     return response()->json([
    //         'message' => 'Danh sách sizes',
    //         'brands' => $brand
    //     ], 200);
    // }
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
            'logo_url' => 'required|string|max:255'
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
        $response = $this->brandService->deleteBrand($brand);

        return $response;
    }
    public function destroyMultiple(Request $request)
    {
        $ids = $request->input('ids');
        return $this->brandService->deleteBrands($ids);
    }
}
