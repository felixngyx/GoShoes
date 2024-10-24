<?php

namespace App\Http\Controllers\Discount;

use App\Http\Controllers\Controller;
use App\Http\Requests\Discound\DiscountStoreRequest;
use App\Models\Discount;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DiscountController extends Controller
{
    public function index(Request $request){
        try {
            $discounts = Discount::with('products')
                ->when($request->status === 'active', function($q) {
                    return $q->where('valid_from', '<=', now())
                            ->where('valid_to', '>=', now())
                            ->where('usage_limit', '>', DB::raw('used_count'));
                })
                ->when($request->status === 'expired', function($q) {
                    return $q->where('valid_to', '<', now())
                            ->orWhere('usage_limit', '<=', DB::raw('used_count'));
                })
                ->orderBy('created_at', 'desc')
                ->paginate($request->per_page ?? 10);

            return response()->json([
                'status' => true,
                'data' => $discounts
            ]);

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
        DB::beginTransaction();
        try {
            $discount = Discount::create($request->validated());

            if ($request->has('product_ids')) {
                $discount->products()->attach($request->product_ids);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Tạo mã giảm giá thành công',
                'data' => $discount->load('products')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi tạo mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $discount = Discount::with('products')->findOrFail($id);
            return response()->json([
                'status' => true,
                'data' => $discount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy mã giảm giá',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(DiscountStoreRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $discount = Discount::findOrFail($id);

            // Không cho phép sửa code nếu đã có người sử dụng
            if ($discount->used_count > 0 && $discount->code !== $request->code) {
                throw new \Exception('Không thể thay đổi mã giảm giá đã được sử dụng');
            }

            $discount->update($request->validated());

            if ($request->has('product_ids')) {
                $discount->products()->sync($request->product_ids);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật mã giảm giá thành công',
                'data' => $discount->load('products')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật mã giảm giá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $discount = Discount::findOrFail($id);

            // Không cho phép xóa nếu đã có người sử dụng
            if ($discount->used_count > 0) {
                throw new \Exception('Không thể xóa mã giảm giá đã được sử dụng');
            }

            $discount->products()->detach();
            $discount->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Xóa mã giảm giá thành công'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi xóa mã giảm giá',
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

            $discount = Discount::where('code', $request->code)
                ->with('products')
                ->first();

            // Kiểm tra thời gian hiệu lực
            if (Carbon::now()->lt($discount->valid_from) || Carbon::now()->gt($discount->valid_to)) {
                throw new \Exception('Mã giảm giá chưa có hiệu lực hoặc đã hết hạn');
            }

            // Kiểm tra số lần sử dụng
            if ($discount->used_count >= $discount->usage_limit) {
                throw new \Exception('Mã giảm giá đã hết lượt sử dụng');
            }

            // Kiểm tra giá trị đơn hàng tối thiểu
            if ($request->total_amount < $discount->min_order_amount) {
                throw new \Exception('Giá trị đơn hàng chưa đạt mức tối thiểu để sử dụng mã giảm giá');
            }

            // Kiểm tra sản phẩm áp dụng (nếu có)
            if ($discount->products->isNotEmpty() && $request->has('product_ids')) {
                $validProductIds = $discount->products->pluck('id')->toArray();
                $requestProductIds = $request->product_ids;

                if (!array_intersect($validProductIds, $requestProductIds)) {
                    throw new \Exception('Mã giảm giá không áp dụng cho các sản phẩm trong đơn hàng');
                }
            }

            // Tính số tiền được giảm
            $discountAmount = $request->total_amount * ($discount->percent / 100);

            return response()->json([
                'status' => true,
                'message' => 'Mã giảm giá hợp lệ',
                'data' => [
                    'discount' => $discount,
                    'discount_amount' => $discountAmount,
                    'final_amount' => $request->total_amount - $discountAmount
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
