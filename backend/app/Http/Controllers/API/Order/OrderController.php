<?php
// OrderController.php

namespace App\Http\Controllers\API\Order;

use App\Events\NewOrderCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderUpdateStatus;
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

    public function index()
    {
        $orders = Order::with([
            'user:id,name,email',
            'shipping:id,address,city',
            'items:id,order_id,product_id,variant_id,quantity,price',
            'items.product:id,name,thumbnail',
            'items.variant:id,size_id,color_id',
            'items.variant.size:id,size',
            'items.variant.color:id,color',
            'payment:order_id,method_id,status,url',
            'payment.method:id,name'
        ])
            ->orderBy('created_at', 'desc')
            ->get([
                'id',
                'user_id',
                'shipping_id',
                'total',
                'status',
                'sku',
                'created_at'
            ]);

        return response()->json([
            'success' => true,
            'data' => $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'sku' => $order->sku,
                    'status' => $order->status,
                    'total' => $order->total,
                    // Thông tin khách hàng
                    'customer' => [
                        'name' => $order->user->name,
                        'email' => $order->user->email,
                    ],

                    // Thông tin địa chỉ giao hàng
                    'shipping' => $order->shipping ? [
                        'address' => $order->shipping->address,
                        'city' => $order->shipping->city,
                    ] : null,

                    // Thông tin thanh toán
                    'payment' => $order->payment ? [
                        'method' => $order->payment->method->name,
                        'status' => $order->payment->status,
                        'url' => $order->payment->url,
                    ] : null,

                    // Chi tiết sản phẩm
                    'items' => $order->items->map(function ($item) {
                        return [
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'subtotal' => $item->quantity * $item->price,
                            'product' => [
                                'name' => $item->product->name,
                                'thumbnail' => (string)$item->product->thumbnail,
                            ],
                            'variant' => $item->variant ? [
                                'size' => $item->variant->size->name,
                                'color' => $item->variant->color->name,
                            ] : null
                        ];
                    })
                ];
            })
        ]);
    }

    public function OrderOneUser()
    {
        $user_id = auth()->user()->id;
        $orders = Order::with([
            'shipping:id,address,city',
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
                    'total' => $order->total * 100,
                    'original_total' => $order->total * 100,
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
                            'price' => $item->price * 100,
                            'subtotal' => $item->quantity * $item->price * 100,
                            'product' => [
                                'name' => $item->product->name,
                                'thumbnail' => (string)$item->product->thumbnail,
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
            $originalTotal = 0;
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
                $originalTotal += $itemTotal;

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
                    $originalTotal,
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
            $finalTotal = $originalTotal - $discountAmount;

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
                'original_total' => $originalTotal,
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
                'url' => null, // Khởi tạo là null, sẽ cập nhật sau nếu có thanh toán online
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
                    Mail::to(auth()->user()->email)->queue(new OrderCreated($order));
                } catch (\Exception $e) {
                    Log::error('Gửi email thất bại: ' . $e->getMessage());
                    // Không throw exception ở đây để không ảnh hưởng đến việc tạo đơn hàng
                }

                DB::commit();

                return response()->json([
                    'order' => $order->load(['items.product', 'items.variant.size', 'items.variant.color', 'shipping']),
                    'payment_url' => null,
                    'original_total' => $originalTotal,
                    'discount_amount' => $discountAmount,
                    'final_total' => $finalTotal,
                ], 201);
            }

            // 8. Khởi tạo thanh toán ZaloPay cho các phương thức khác
            $paymentResponse = $this->initiatePayment($order);

            if (isset($paymentResponse['return_code']) && $paymentResponse['return_code'] == 1) {
                $payment_url = $paymentResponse['order_url'];

                // Cập nhật URL thanh toán vào payment
                $payment->update(['url' => $payment_url]);

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

                DB::commit();
                event(new NewOrderCreated($order->id));
                return response()->json([
                    'order' => $order->load(['items.product', 'items.variant.size', 'items.variant.color', 'shipping', 'payment.method']),
                    'payment_url' => $payment_url,
                    'original_total' => $originalTotal,
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


    // Helper methods để xác định trạng thái
    private function determineOrderStatus($finalTotal, $isCOD)
    {
        if ($finalTotal == 0) {
            return 'completed';
        }
        // Đơn hàng COD luôn bắt đầu với trạng thái processing
        if ($isCOD) {
            return 'processing';
        }
        // Đơn hàng ZaloPay bắt đầu với trạng thái pending
        return 'pending';
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

    private function determinePaymentStatus($finalTotal, $isCOD)
    {
        if ($finalTotal == 0) {
            return 'paid';
        }
        // Thanh toán COD luôn bắt đầu với trạng thái pending
        if ($isCOD) {
            return 'pending';
        }
        // Thanh toán ZaloPay bắt đầu với trạng thái pending
        return 'pending';
    }

    protected function updateOrderStatus($order, $paymentStatus)
    {
        // Xử lý riêng cho ZaloPay
        if ($order->payment->method_id != 2) { // Giả sử method_id = 2 là COD
            if ($paymentStatus['return_code'] == 1) {
                $order->update(['status' => 'completed']);
                $order->payment()->update(['status' => 'paid']);
            } elseif ($paymentStatus['return_code'] == 2) {
                $order->update(['status' => 'pending']);
                $order->payment()->update(['status' => 'pending']);
            } else {
                $this->handleFailedPayment($order);
            }
        }
    }

    protected function handleFailedPayment($order)
    {
        $order->update(['status' => 'canceled']);
        $order->payment()->update(['status' => 'canceled']);

        // Hoàn trả số lượng sản phẩm
        foreach ($order->items as $item) {
            if ($item->variant_id) {
                ProductVariant::find($item->variant_id)
                    ->increment('quantity', $item->quantity);
            } else {
                Product::find($item->product_id)
                    ->increment('stock_quantity', $item->quantity);
            }
        }

        // Hoàn trả lượt sử dụng mã giảm giá
        if ($order->discount_code) {
            Discount::where('code', $order->discount_code)
                ->decrement('used_count');
        }
    }

    public function UpdateOrder(OrderUpdateStatus $request, $id)
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($id);
            $status = $request->status;
            $prevStatus = $order->status;

            // Cập nhật trạng thái đơn hàng
            $order->update(['status' => $status]);

            // Tìm thanh toán liên quan
            $orderPayment = $order->payment;
            if (!$orderPayment) {
                throw new \Exception('Không tìm thấy thông tin thanh toán');
            }

            // Xử lý dựa trên phương thức thanh toán
            if ($orderPayment->method_id == 2) { // COD
                switch ($status) {
                    case 'completed':
                        $orderPayment->update(['status' => 'paid']);
                        break;
                    case 'canceled':
                        $orderPayment->update(['status' => 'canceled']);
                        // Hoàn trả số lượng sản phẩm và mã giảm giá nếu đơn bị hủy
                        if ($prevStatus != 'canceled') {
                            $this->handleFailedPayment($order);
                        }
                        break;
                    default:
                        $orderPayment->update(['status' => 'pending']);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Cập nhật đơn hàng thành công'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Cập nhật đơn hàng thất bại: ' . $e->getMessage());
            return response()->json([
                'error' => 'Cập nhật đơn hàng thất bại',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function renewPaymentLink($id)
    {
        try {
            DB::beginTransaction();

            // Tìm đơn hàng của user hiện tại
            $order = Order::where('user_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            // Kiểm tra trạng thái đơn hàng - mở rộng các trạng thái hợp lệ
            $validStatuses = ['pending', 'failed', 'canceled', 'expired'];
            if (!in_array($order->status, $validStatuses)) {
                throw new \Exception('This order is not supported to renew payment link');
            }

            // Kiểm tra phương thức thanh toán
            $payment = $order->payment;
            if (!$payment || $payment->method_id == 2) { // 2 là COD
                throw new \Exception('This order is not supported to renew payment link');
            }

            // Tạo SKU mới cho giao dịch mới
            $newSku = $this->generateSKU();

            // Lưu SKU cũ vào trường meta hoặc log nếu cần thiết
            $oldSku = $order->sku;
            Log::info("Renewing payment for order: Old SKU: {$oldSku}, New SKU: {$newSku}");

            // Cập nhật SKU mới cho đơn hàng
            $order->update(['sku' => $newSku]);

            // Khởi tạo request cho ZaloPay với số tiền đã được chuyển đổi sang xu
            $paymentRequest = new Request([
                'order_id' => $newSku,
                'amount' => $order->total * 100, // Chuyển đổi sang xu cho ZaloPay
            ]);

            // Khởi tạo thanh toán ZaloPay mới
            $paymentResponse = $this->initiatePayment($order);

            if (isset($paymentResponse['return_code']) && $paymentResponse['return_code'] == 1) {
                $payment_url = $paymentResponse['order_url'];

                // Cập nhật URL thanh toán mới và trạng thái
                $payment->update([
                    'url' => $payment_url,
                    'status' => 'pending'
                ]);

                // Cập nhật trạng thái đơn hàng
                $order->update(['status' => 'pending']);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'payment_url' => $payment_url,
                    'message' => 'Renew payment link successfully, you have 15 minutes to complete the payment'
                ]);
            } else {
                // Khôi phục SKU cũ nếu tạo link thất bại
                $order->update(['sku' => $oldSku]);
                throw new \Exception('Failed to create payment: ' . json_encode($paymentResponse));
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to renew payment link: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to renew payment link',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            // Kiểm tra quyền truy cập
            $user = auth()->user();
            $order = Order::findOrFail($id);

            if (!$user->is_admin && $order->user_id !== $user->id) {
                throw new \Exception('Bạn không có quyền truy cập đơn hàng này');
            }

            $order->load([
                'user:id,name,email',
                'shipping:id,address,city',
                'items:id,order_id,product_id,variant_id,quantity,price',
                'items.product:id,name,thumbnail',
                'items.variant:id,size_id,color_id',
                'items.variant.size:id,size',
                'items.variant.color:id,color',
                'payment:order_id,method_id,status,url',
                'payment.method:id,name'
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $order->id,
                    'sku' => $order->sku,
                    'status' => $order->status,
                    'total' => $order->total,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),

                    // Thông tin khách hàng
                    'customer' => [
                        'name' => $order->user->name,
                        'email' => $order->user->email,
                    ],

                    // Thông tin địa chỉ giao hàng
                    'shipping' => $order->shipping ? [
                        'address' => $order->shipping->address,
                        'city' => $order->shipping->city,
                    ] : null,

                    // Thông tin thanh toán
                    'payment' => $order->payment ? [
                        'method' => $order->payment->method->name,
                        'status' => $order->payment->status,
                        'url' => $order->payment->url,
                    ] : null,

                    // Chi tiết sản phẩm
                    'items' => $order->items->map(function ($item) {
                        return [
                            'quantity' => $item->quantity,
                            'price' => $item->price * 100,
                            'subtotal' => $item->quantity * $item->price * 100,
                            'product' => [
                                'name' => $item->product->name,
                                'thumbnail' => (string)$item->product->thumbnail,
                            ],
                            'variant' => $item->variant ? [
                                'size' => $item->variant->size->size,
                                'color' => $item->variant->color->color,
                            ] : null
                        ];
                    })
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể truy cập đơn hàng',
                'error' => $e->getMessage()
            ], 403);
        }
    }
}
