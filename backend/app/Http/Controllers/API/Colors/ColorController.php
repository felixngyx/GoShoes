<?php

namespace App\Http\Controllers\API\Colors;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreColorRequest;
use App\Models\VariantColor;
// use App\Services\Color\ColorService;
use App\Services\Color\ColorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ColorController extends Controller
{

    protected $colorService;
    public function __construct(ColorService $colorService)
    {
        $this->colorService = $colorService;
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

        $query = VariantColor::query();
        $clors = $query->orderBy($orderBy, $order)
        ->paginate($limit, ['*'], 'page', $page);
        return response()->json([
            'message' => 'Danh sách sizes',
            'clors' => $clors
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
    public function store(StoreColorRequest $request)
    {
        $validated = $request->validated();
        Log::info($validated);


        $color = $this->colorService->storeColor($validated);
        return response()->json([
            'message' => 'Màu sắc đã được thêm thành công!',
            'color' => $color
        ], 201);
    }

    public function show(string $id)
    {
        $color = $this->colorService->findColor($id);
        if (!$color) {
            return response()->json([
                'message' => 'Màu sắc không tồn tại',
            ], 404);
        }
        return response()->json([
            'color' => $color
        ], 200);
    }

   
    public function edit(string $id) {}

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'color' => 'required|string|max:255|unique:variant_colors,color,' . $id,
            'link_image' => 'required|string|max:255',
        ]);

        $color = $this->colorService->updateColor($id, $validated);
        return response()->json([
            'message' => 'Màu sắc đã được cập nhật thành công!',
            'color' => $color
        ], 200);
    }

    
    public function destroy(string $id)
    {
        // Tìm sản phẩm theo ID
        $color = $this->colorService->findColor($id);

        if (!$color) {
            return response()->json(['message' => 'Màu sắc không tồn tại!'], 404);
        }

        // Xóa Màu sắc
        $this->colorService->deleteColor($color);

        return response()->json(['message' => 'Màu sắc đã được xóa thành công!'], 200);
    }
    public function destroyMultiple(Request $request){
        $ids = $request->input('ids');
        return $this->colorService->deleteColors($ids);
    }
}
