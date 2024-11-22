<?php

namespace App\Http\Controllers\API\Sizes;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSizeRequest;
use App\Models\VariantSize;
use App\Services\Sizes\SizeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SizeController extends Controller
{

    protected $sizeService;

    public function __construct(SizeService $sizeService)
    {
        $this->sizeService = $sizeService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $limit = $request->input('limit', null);
        $orderBy = $request->input('orderBy', 'id');
        $order = $request->input('order', 'asc');

        $query = VariantSize::query();
        $sizes = $query->orderBy($orderBy, $order)
        ->paginate($limit, ['*'], 'page', $page);
        return response()->json([
            'message' => 'Danh sách sizes',
            'sizes' => $sizes
        ], 200);
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
    public function store(StoreSizeRequest $request)
    {
        $validated = $request->validated();
        Log::info($validated);


        $size = $this->sizeService->storeSize($validated);
        return response()->json([
            'message' => 'Size đã được thêm thành công!',
            'size' => $size
        ], 201);
    }

    public function show(string $id)
    {
        $size = $this->sizeService->findSize($id);
        if (!$size) {
            return response()->json([
                'message' => 'Size không tồn tại',
            ], 404);
        }
        return response()->json([
            'size' => $size
        ], 200);
    }


    public function edit(string $id) {}

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'size' => 'required|string|max:255|unique:variant_sizes,size,' . $id,
            'code' => 'required|string|max:20',



        ]);

        $size = $this->sizeService->updateSize($id, $validated);
        return response()->json([
            'message' => 'size đã được cập nhật thành công!',
            'product' => $size
        ], 200);
    }


    public function destroy(string $id)
    {
        // Tìm sản phẩm theo ID
        $size = $this->sizeService->findSize($id);

        if (!$size) {
            return response()->json(['message' => 'Size không tồn tại!'], 404);
        }

        // Xóa Màu sắc
        $this->sizeService->deleteSize($size);

        return response()->json(['message' => 'Size đã được xóa thành công!'], 200);
    }
    public function destroyMultiple(Request $request){
        $ids = $request->input('ids');
        return $this->sizeService->deleteSizes($ids);
    }
}
