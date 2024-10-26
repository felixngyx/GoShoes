<?php
// OrderController.php

namespace App\Http\Controllers\API\Order;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\ProductVariant;
use App\Models\Discount;
use App\Http\Controllers\API\Payments\ZaloPaymentController;
use App\Http\Requests\Order\OrderStoreRequest;
use App\Mail\OrderCreated;
use App\Models\PaymentMethod;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    protected $zaloPaymentController;

    public function __construct(ZaloPaymentController $zaloPaymentController)
    {
        $this->zaloPaymentController = $zaloPaymentController;
    }

    public function index() {}

    public function OrderOneUser()
{
    $user_id = auth()->user()->id;
    $orders = Order::with([
        // Chỉ lấy thông tin địa chỉ giao hàng cần thiết
        'shipping:id,address,city',
        // Chỉ lấy thông tin sản phẩm cơ bản
        'items:id,order_id,product_id,quantity,price',
        'items.product:id,name,thumbnail'
    ])
    ->where('user_id', $user_id)
    ->orderBy('created_at', 'desc')
    ->get([
        'id',
        'shipping_id',
        'total',
        'created_at'
    ]);

    return response()->json([
        'success' => true,
        'data' => $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'total' => $order->total,
                'created_at' => $order->created_at->format('Y-m-d'),

                // Thông tin địa chỉ giao hàng
                'shipping' => $order->shipping ? [
                    'address' => $order->shipping->address,
                    'city' => $order->shipping->city,
                ] : null,

                // Chi tiết sản phẩm
                'items' => $order->items->map(function ($item) {
                    return [
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->quantity * $item->price,
                        'product' => [
                            'name' => $item->product->name,
                            'thumbnail' => $item->product->thumbnail,
                        ]
                    ];
                })
            ];
        })
    ]);
}

public function store(OrderStoreRequest $request)
{
    DB::beginTransaction();

    try {
        // 1. Tính toán tổng giá trị ban đầu và kiểm tra tồn kho
        $total = 0;
        $items = [];

        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $variant = null;

            // Kiểm tra nếu sản phẩm có biến thể
            if (isset($item['variant_id'])) {
                $variant = ProductVariant::findOrFail($item['variant_id']);
                if ($variant->quantity < $item['quantity']) {
                    throw new \Exception("Sản phẩm {$product->name} không đủ số lượng trong kho");
                }
                $price = $product->promotional_price ?? $product->price;
            } else {
                // Nếu không có biến thể, kiểm tra số lượng sản phẩm trực tiếp
                if ($product['stock_quantity'] < $item['quantity']) {
                    throw new \Exception("Sản phẩm {$product->name} không đủ số lượng trong kho");
                }
                $price = $product->promotional_price ?? $product->price;
            }

            $itemTotal = $price * $item['quantity'];
            $total += $itemTotal;

            $items[] = [
                'variant_id' => $item['variant_id'] ?? null, // Biến thể có thể null
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $price,
            ];
        }

        // 2. Xử lý mã giảm giá
        $discountAmount = 0;
        $discountCode = null;
        if ($request->has('discount_code')) {
            $discountValidation = $this->validateDiscount(
                $request->discount_code,
                $total,
                array_column($items, 'product_id')
            );

            if (!$discountValidation['status']) {
                throw new \Exception($discountValidation['message']);
            }

            $discount = $discountValidation['discount'];
            $discountAmount = $discountValidation['discount_amount'];
            $discountCode = $request->discount_code;
        }

        // 3. Tính tổng giá trị cuối cùng
        $finalTotal = $total - $discountAmount;

        // Kiểm tra phương thức thanh toán
        $paymentMethod = PaymentMethod::findOrFail($request->payment_method_id);
        $isCOD = $paymentMethod->id === 2; // Giả sử ID 1 là COD

        // 4. Tạo đơn hàng
        $order = Order::create([
            'user_id' => auth()->user()->id,
            'total' => $finalTotal,
            'status' => $this->determineOrderStatus($finalTotal, $isCOD),
            'shipping_id' => $request->shipping_id,
            'sku' => $this->generateSKU(),
            'discount_code' => $discountCode,
            'discount_amount' => $discountAmount,
            'original_total' => $total,
        ]);

        // 5. Tạo chi tiết đơn hàng và cập nhật tồn kho
        foreach ($items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);

            if ($item['variant_id']) {
                ProductVariant::find($item['variant_id'])
                    ->decrement('quantity', $item['quantity']);
            } else {
                Product::find($item['product_id'])
                    ->decrement('stock_quantity', $item['quantity']);
            }
        }

        // 6. Tạo bản ghi thanh toán với trạng thái tương ứng
        $payment = OrderPayment::create([
            'order_id' => $order->id,
            'method_id' => $request->payment_method_id,
            'status' => $this->determinePaymentStatus($finalTotal, $isCOD),
            'amount' => $finalTotal,
        ]);

        // 7. Xử lý tiếp theo dựa trên phương thức thanh toán
        if ($isCOD || $finalTotal == 0) {
            // Cập nhật số lượt sử dụng mã giảm giá nếu có
            if ($discountCode) {
                Discount::where('code', $discountCode)->increment('used_count');
            }

            // Gửi email xác nhận đơn hàng
            try {
                Mail::to(auth()->user()->email)->send(new OrderCreated($order));
            } catch (\Exception $e) {
                Log::error('Gửi email thất bại: ' . $e->getMessage());
                // Không throw exception ở đây để không ảnh hưởng đến việc tạo đơn hàng
            }

            DB::commit();

            return response()->json([
                'order' => $order->load(['items.product', 'items.variant.size', 'items.variant.color', 'shipping', 'payment.method']),
                'payment_url' => null,
                'original_total' => $total,
                'discount_amount' => $discountAmount,
                'final_total' => $finalTotal,
            ], 201);
        }

        // 8. Khởi tạo thanh toán ZaloPay cho các phương thức khác
        $paymentResponse = $this->initiatePayment($order);

        if (isset($paymentResponse['return_code']) && $paymentResponse['return_code'] == 1) {
            // Cập nhật số lượt sử dụng mã giảm giá
            if ($discountCode) {
                Discount::where('code', $discountCode)->increment('used_count');
            }

            // Gửi email xác nhận đơn hàng
            try {
                Mail::to(auth()->user()->email)->send(new OrderCreated($order));
            } catch (\Exception $e) {
                Log::error('Gửi email thất bại: ' . $e->getMessage());
            }

            $payment_url = $paymentResponse['order_url'];

            DB::commit();

            return response()->json([
                'order' => $order->load(['items.product', 'items.variant.size', 'items.variant.color', 'shipping', 'payment.method']),
                'payment_url' => $payment_url,
                'original_total' => $total,
                'discount_amount' => $discountAmount,
                'final_total' => $finalTotal,
            ], 201);
        } else {
            throw new \Exception('Khởi tạo thanh toán thất bại: ' . json_encode($paymentResponse));
        }
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Tạo đơn hàng thất bại: ' . $e->getMessage());
        return response()->json([
            'error' => 'Tạo đơn hàng thất bại',
            'message' => $e->getMessage()
        ], 500);
    }
}


// Helper methods để xác định trạng thái
private function determineOrderStatus($finalTotal, $isCOD)
{
    if ($finalTotal == 0) {
        return 'completed';
    }
    if ($isCOD) {
        return 'processing';
    }
    return 'pending';
}

private function determinePaymentStatus($finalTotal, $isCOD)
{
    if ($finalTotal == 0) {
        return 'success';
    }
    if ($isCOD) {
        return 'pending';
    }
    return 'pending';
}

    protected function validateDiscount($code, $total, $productIds)
    {
        $discount = Discount::where('code', $code)
            ->with('products')
            ->first();

        if (!$discount) {
            return [
                'status' => false,
                'message' => 'Mã giảm giá không tồn tại'
            ];
        }

        // Kiểm tra thời hạn
        if (now()->lt($discount->valid_from) || now()->gt($discount->valid_to)) {
            return [
                'status' => false,
                'message' => 'Mã giảm giá chưa có hiệu lực hoặc đã hết hạn'
            ];
        }

        // Kiểm tra số lượt sử dụng
        if ($discount->used_count >= $discount->usage_limit) {
            return [
                'status' => false,
                'message' => 'Mã giảm giá đã hết lượt sử dụng'
            ];
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if ($total < $discount->min_order_amount) {
            return [
                'status' => false,
                'message' => 'Giá trị đơn hàng chưa đạt mức tối thiểu để sử dụng mã giảm giá'
            ];
        }

        // Kiểm tra sản phẩm áp dụng
        if ($discount->products->isNotEmpty()) {
            $validProductIds = $discount->products->pluck('id')->toArray();
            if (!array_intersect($validProductIds, $productIds)) {
                return [
                    'status' => false,
                    'message' => 'Mã giảm giá không áp dụng cho các sản phẩm trong đơn hàng'
                ];
            }
        }

        $discountAmount = $total * ($discount->percent / 100);

        return [
            'status' => true,
            'discount' => $discount,
            'discount_amount' => $discountAmount
        ];
    }

    public function checkPaymentStatus($id)
    {
        try {
            $order = Order::where('user_id', auth()->id())->findOrFail($id);
            $payment = $order->payment;

            if (!$payment) {
                return response()->json([
                    'error' => 'Không tìm thấy thông tin thanh toán cho đơn hàng này'
                ], 404);
            }

            $paymentStatus = $this->zaloPaymentController->searchStatus(
                new Request(['app_trans_id' => $payment->id])
            );

            $this->updateOrderStatus($order, $paymentStatus->original);

            return response()->json([
                'order_status' => $order->status,
                'payment_status' => $payment->status,
                'zalopay_response' => $paymentStatus->original
            ]);
        } catch (\Exception $e) {
            Log::error('Kiểm tra trạng thái thanh toán thất bại: ' . $e->getMessage());
            return response()->json([
                'error' => 'Kiểm tra trạng thái thanh toán thất bại',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    protected function updateOrderStatus($order, $paymentStatus)
    {
        if ($paymentStatus['return_code'] == 1) {
            $order->update(['status' => 'completed']);
            $order->payment()->update(['status' => 'success']);
        } elseif ($paymentStatus['return_code'] == 2) {
            $order->update(['status' => 'pending']);
            $order->payment()->update(['status' => 'pending']);
        } else {
            $order->update(['status' => 'cancelled']);
            $order->payment()->update(['status' => 'failed']);

            // Hoàn trả số lượng sản phẩm
            foreach ($order->items as $item) {
                ProductVariant::find($item->variant_id)
                    ->increment('quantity', $item->quantity);
            }

            // Hoàn trả lượt sử dụng mã giảm giá
            if ($order->discount_code) {
                Discount::where('code', $order->discount_code)
                    ->decrement('used_count');
            }
        }
    }

    protected function generateSKU()
    {
        $prefix = 'ORD';
        $timestamp = now()->format('YmdHis');
        $random = str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
        return $prefix . $timestamp . $random;
    }

    protected function initiatePayment($order)
    {
        $paymentRequest = new Request([
            'order_id' => $order->sku,
            'amount' => $order->total * 100, // Chuyển đổi sang đơn vị xu
        ]);

        $response = $this->zaloPaymentController->paymentZalo($paymentRequest);
        return json_decode($response->getContent(), true);
    }
}
