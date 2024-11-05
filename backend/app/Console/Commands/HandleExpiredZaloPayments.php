<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\OrderPayment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class HandleExpiredZaloPayments extends Command
{
    protected $signature = 'orders:handle-expired-payments';
    protected $description = 'Check and handle expired ZaloPay payment links';

    public function handle()
    {
        try {
            DB::beginTransaction();

            // Tìm các đơn hàng ZaloPay đang pending quá 15 phút
            $expiredOrders = Order::where('status', 'pending')
                ->whereHas('payment', function ($query) {
                    $query->where('method_id', '!=', 2) // Không phải COD
                        ->where('status', 'pending');
                })
                ->where('created_at', '<=', Carbon::now()->subMinutes(15))
                ->with(['payment', 'items'])
                ->get();

            foreach ($expiredOrders as $order) {
                // Cập nhật trạng thái đơn hàng
                $order->update(['status' => 'expired']);
                
                // Cập nhật trạng thái thanh toán
                $order->payment->update(['status' => 'expired']);

                // Hoàn trả số lượng sản phẩm
                foreach ($order->items as $item) {
                    if ($item->variant_id) {
                        DB::table('product_variants')
                            ->where('id', $item->variant_id)
                            ->increment('quantity', $item->quantity);
                    } else {
                        DB::table('products')
                            ->where('id', $item->product_id)
                            ->increment('stock_quantity', $item->quantity);
                    }
                }

                // Hoàn trả lượt sử dụng mã giảm giá nếu có
                if ($order->discount_code) {
                    DB::table('discounts')
                        ->where('code', $order->discount_code)
                        ->decrement('used_count');
                }

                Log::info("Marked order #{$order->id} as expired after 15 minutes");
            }

            DB::commit();
            $this->info("Successfully processed " . $expiredOrders->count() . " expired orders");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process expired orders: ' . $e->getMessage());
            $this->error('Failed to process expired orders: ' . $e->getMessage());
        }
    }
}