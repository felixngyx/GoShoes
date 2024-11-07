<?php

namespace App\Services;

use App\Repositories\DiscountRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\Discount;

class DiscountService
{
    protected $discountRepository;

    public function __construct(DiscountRepository $discountRepository)
    {
        $this->discountRepository = $discountRepository;
    }

    public function getAllDiscounts($request)
    {
        return $this->discountRepository->getAll(
            $request->per_page ?? 10,
            $request->status
        );
    }

    public function createDiscount(array $data)
    {
        \Log::info('Creating discount with data:', $data);

        return DB::transaction(function () use ($data) {
            try {
                // Create discount
                $discount = $this->discountRepository->create([
                    'code' => $data['code'],
                    'description' => $data['description'],
                    'valid_from' => $data['valid_from'],
                    'valid_to' => $data['valid_to'],
                    'min_order_amount' => $data['min_order_amount'],
                    'usage_limit' => $data['usage_limit'],
                    'percent' => $data['percent'],
                    'used_count' => 0
                ]);

                \Log::info('Discount created:', ['discount_id' => $discount->id]);

                // Attach products
                if (isset($data['product_ids']) && !empty($data['product_ids'])) {
                    \Log::info('Attaching products:', ['product_ids' => $data['product_ids']]);

                    // Verify products exist
                    $validProductIds = Product::whereIn('id', $data['product_ids'])
                        ->pluck('id')
                        ->toArray();

                    if (!empty($validProductIds)) {
                        $discount->products()->attach($validProductIds);
                        \Log::info('Products attached successfully');
                    } else {
                        \Log::warning('No valid product IDs found');
                    }
                }

                // Reload with products
                $discount = $discount->fresh('products');
                \Log::info('Final discount data:', [
                    'discount_id' => $discount->id,
                    'product_count' => $discount->products->count()
                ]);

                return $discount;

            } catch (\Exception $e) {
                \Log::error('Error in createDiscount:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        });
    }

    public function updateDiscount($id, $data)
    {
        $discount = $this->discountRepository->findById($id);

        if ($discount->used_count > 0 && $discount->code !== $data['code']) {
            throw new \Exception('Không thể thay đổi mã giảm giá đã được sử dụng');
        }

        return $this->discountRepository->update($id, $data);
    }

    public function deleteDiscount($id)
    {
        try {
            $discount = $this->discountRepository->findById($id);

            if ($discount->used_count > 0) {
                throw new \Exception('Không thể xóa mã giảm giá đã được sử dụng');
            }

            return $this->discountRepository->delete($id);
        } catch (\Exception $e) {
            throw new \Exception('Không tìm thấy mã giảm giá');
        }
    }

    public function validateDiscount($code, $totalAmount, $productIds = [])
    {
        $discount = $this->discountRepository->findByCode($code);

        if (!$discount) {
            throw new \Exception('Mã giảm giá không tồn tại');
        }

        $this->validateTimeRange($discount);
        $this->validateUsageLimit($discount);
        $this->validateMinimumAmount($discount, $totalAmount);
        $this->validateProducts($discount, $productIds);

        return [
            'discount' => $discount,
            'discount_amount' => $this->calculateDiscountAmount($discount, $totalAmount),
            'final_amount' => $totalAmount - $this->calculateDiscountAmount($discount, $totalAmount)
        ];
    }

    protected function validateTimeRange($discount)
    {
        if (Carbon::now()->lt($discount->valid_from) || Carbon::now()->gt($discount->valid_to)) {
            throw new \Exception('Mã giảm giá chưa có hiệu lực hoặc đã hết hạn');
        }
    }

    protected function validateUsageLimit($discount)
    {
        if ($discount->used_count >= $discount->usage_limit) {
            throw new \Exception('Mã giảm giá đã hết lượt sử dụng');
        }
    }

    protected function validateMinimumAmount($discount, $totalAmount)
    {
        if ($totalAmount < $discount->min_order_amount) {
            throw new \Exception('Giá trị đơn hàng chưa đạt mức tối thiểu để sử dụng mã giảm giá');
        }
    }

    protected function validateProducts($discount, $productIds)
    {
        if ($discount->products->isNotEmpty() && !empty($productIds)) {
            $validProductIds = $discount->products->pluck('id')->toArray();
            if (!array_intersect($validProductIds, $productIds)) {
                throw new \Exception('Mã giảm giá không áp dụng cho các sản phẩm trong đơn hàng');
            }
        }
    }

    protected function calculateDiscountAmount($discount, $totalAmount)
    {
        return $totalAmount * ($discount->percent / 100);
    }

    public function getStatistics($id)
    {
        $discount = $this->discountRepository->findById($id);

        return [
            'total_uses' => $discount->uses_count,
            'total_amount_saved' => $discount->total_amount_saved,
            'last_used_at' => $discount->last_used_at
        ];
    }

    public function getDiscountById($id)
    {
        return Discount::with('products')->findOrFail($id);
    }
}
