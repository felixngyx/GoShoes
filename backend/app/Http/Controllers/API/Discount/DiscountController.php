<?php

namespace App\Http\Controllers\API\Discount;

use App\Http\Controllers\Controller;
use App\Http\Requests\Discount\DiscountStoreRequest;
use App\Http\Requests\Discount\DiscountUpdateRequest;
use App\Services\DiscountService;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    protected $discountService;

    public function __construct(DiscountService $discountService)
    {
        $this->discountService = $discountService;
    }

    public function index(Request $request)
    {
        try {
            $discounts = $this->discountService->getAllDiscounts($request);
            return response()->json(['status' => true, 'data' => $discounts]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(DiscountStoreRequest $request)
    {
        try {
            \Log::info('Request data:', $request->validated());

            $discount = $this->discountService->createDiscount($request->validated());

            \Log::info('Created discount:', [
                'discount' => $discount->toArray(),
                'has_products' => $discount->products->isNotEmpty(),
                'product_count' => $discount->products->count()
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Discount created successfully',
                'data' => $discount
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error in discount creation:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to create discount',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(DiscountUpdateRequest $request, $id)
    {
        try {
            $discount = $this->discountService->updateDiscount($id, $request->validated());
            return response()->json([
                'status' => true,
                'message' => 'Cập nhật mã giảm giá thành công',
                'data' => $discount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function validateCode(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string|exists:discounts,code',
                'total_amount' => 'required|numeric|min:0',
                'product_ids' => 'sometimes|array',
                'product_ids.*' => 'exists:products,id'
            ]);

            $result = $this->discountService->validateDiscount(
                $request->code,
                $request->total_amount,
                $request->product_ids
            );

            return response()->json([
                'status' => true,
                'message' => 'Mã giảm giá hợp lệ',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy($id)
    {
        try {
            $this->discountService->deleteDiscount($id);
            return response()->json([
                'status' => true,
                'message' => 'Xóa mã giảm giá thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        try {
            $discount = $this->discountService->getDiscountById($id);
            return response()->json([
                'status' => true,
                'data' => $discount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getStatistics($id)
    {
        $statistics = $this->discountService->getStatistics($id);
        return response()->json(['status' => true, 'data' => $statistics]);
    }

}
