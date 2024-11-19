<?php

namespace App\Http\Controllers\API\Discount;

use App\Http\Controllers\Controller;
use App\Http\Requests\Discount\DiscountStoreRequest;
use App\Http\Requests\Discount\DiscountUpdateRequest;
use App\Services\DiscountService;
use Illuminate\Http\Request;
use App\Models\Discount;
use App\Models\Product;

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

    public function applyDiscount(Request $request)
    {
        try {
            // Validate đầu vào
            $request->validate([
                'code' => 'required|string',
                'total_amount' => 'required|numeric|min:0',
                'product_ids' => 'required|array',
                'product_ids.*' => 'exists:products,id'
            ]);

            // Tìm mã giảm giá
            $discount = Discount::with('products')
                ->where('code', $request->code)
                ->where('valid_from', '<=', now())
                ->where('valid_to', '>=', now())
                ->first();

            if (!$discount) {
                return response()->json([
                    'status' => false,
                    'message' => 'Mã giảm giá không tồn tại hoặc đã hết hạn'
                ], 400);
            }

            // Kiểm tra số lần sử dụng
            if ($discount->usage_limit > 0 && $discount->used_count >= $discount->usage_limit) {
                return response()->json([
                    'status' => false,
                    'message' => 'Mã giảm giá đã hết lượt sử dụng'
                ], 400);
            }

            // Kiểm tra giá trị đơn hàng tối thiểu
            if ($discount->min_order_amount && $request->total_amount < $discount->min_order_amount) {
                return response()->json([
                    'status' => false,
                    'message' => sprintf(
                        'Đơn hàng tối thiểu %s để sử dụng mã này',
                        number_format($discount->min_order_amount, 0, ',', '.')
                    )
                ], 400);
            }

            // Kiểm tra sản phẩm áp dụng
            $discountProducts = $discount->products;
            $discountAmount = 0;

            if ($discountProducts->isNotEmpty()) {
                // Trường hợp mã giảm giá chỉ áp dụng cho sản phẩm cụ thể
                $applicableProducts = Product::whereIn('id', $request->product_ids)
                    ->whereIn('id', $discountProducts->pluck('id'))
                    ->get();

                if ($applicableProducts->isEmpty()) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng'
                    ], 400);
                }

                // Tính tổng tiền các sản phẩm được áp dụng
                $applicableAmount = $applicableProducts->sum(function ($product) {
                    return $product->promotional_price ?? $product->price;
                });

                $discountAmount = ($applicableAmount * $discount->percent) / 100;
            } else {
                // Trường hợp mã giảm giá áp dụng cho toàn bộ đơn hàng
                $discountAmount = ($request->total_amount * $discount->percent) / 100;
            }

            // Làm tròn số tiền giảm
            $discountAmount = round($discountAmount);
            $finalAmount = $request->total_amount - $discountAmount;

            return response()->json([
                'status' => true,
                'data' => [
                    'original_amount' => $request->total_amount,
                    'discount_amount' => $discountAmount,
                    'final_amount' => $finalAmount,
                    'discount_info' => [
                        'code' => $discount->code,
                        'description' => $discount->description,
                        'percent' => $discount->percent,
                        'valid_to' => $discount->valid_to->format('Y-m-d H:i:s'),
                        'remaining_uses' => $discount->usage_limit ?
                            ($discount->usage_limit - $discount->used_count) : null
                    ]
                ],
                'message' => 'Áp dụng mã giảm giá thành công'
            ]);

        } catch (\Exception $e) {
            \Log::error('Lỗi khi áp dụng mã giảm giá: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi áp dụng mã giảm giá'
            ], 500);
        }
    }

}
