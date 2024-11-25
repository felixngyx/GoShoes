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
use App\Models\Notification;

class OrderController extends Controller
{
    protected $zaloPaymentController;

    public function __construct(ZaloPaymentController $zaloPaymentController)
    {
        $this->zaloPaymentController = $zaloPaymentController;
        $this->middleware('throttle:1000,1');
    }

    public function index()
    {
        $orders = Order::with([
            'user:id,name,email,avt',
            'shipping:id,user_id,shipping_detail,is_default',
            'items:id,order_id,product_id,variant_id,quantity,price',
            'items.product:id,name,thumbnail',
            'items.variant:id,size_id,color_id',
            'items.variant.size:id,size',
            'items.variant.color:id,color',
            'payment:order_id,method_id,status,url',
            'payment.method:id,name'
        ])
            ->orderBy('created_at', 'desc')
            ->paginate(10, [  // Sử dụng paginate và chỉ định số lượng bản ghi trên mỗi trang
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
            'data' => $orders->getCollection()->map(function ($order) {
                return [
                    'id' => $order->id,
                    'sku' => $order->sku,
                    'status' => $order->status,
                    'total' => $order->total,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                    // Thông tin khách hàng
                    'customer' => [
                        'avt' => $order->user->avt,
                        'name' => $order->user->name,
                        'email' => $order->user->email,
                    ],

                    // Thông tin địa chỉ giao hàng
                    'shipping' => $order->shipping ? [
                        'id' => $order->shipping->id,
                        'shipping_detail' => $order->shipping->shipping_detail,
                        'is_default' => $order->shipping->is_default,
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
                                'thumbnail' => (string) $item->product->thumbnail,
                            ],
                            'variant' => $item->variant ? [
                                'size' => $item->variant->size->size,
                                'color' => $item->variant->color->color,
                            ] : null
                        ];
                    })
                ];
            }),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    public function OrderOneUser(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $status = $request->get('status');
        $search = $request->get('search');
        $user_id = auth()->user()->id;

        $query = Order::with([
            'shipping:id,user_id,shipping_detail,is_default',
            'items:id,order_id,product_id,variant_id,quantity,price',
            'items.product:id,name,thumbnail',
            'items.variant:id,size_id,color_id',
            'items.variant.size:id,size',
            'items.variant.color:id,color',
            'payment:order_id,method_id,status,url',
            'payment.method:id,name'
        ])
            ->where('user_id', $user_id);

        // Filter theo status nếu có
        if ($status) {
            $query->where('status', $status);
        }

        // Search theo keyword
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                    ->orWhereHas('items.product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($perPage, [
                'id',
                'shipping_id',
                'total',
                'original_total',
                'sku',
                'status',
                'created_at'
            ]);

        return response()->json([
            'success' => true,
            'data' => $orders->getCollection()->map(function ($order) {
                return [
                    'id' => $order->id,
                    'total' => $order->total,
                    'original_total' => $order->original_total,
                    'sku' => $order->sku,
                    'status' => $order->status,
                    'created_at' => $order->created_at->format('Y-m-d'),

                    // Thông tin địa chỉ giao hàng
                    'shipping' => $order->shipping ? [
                        'id' => $order->shipping->id,
                        'shipping_detail' => $order->shipping->shipping_detail,
                        'is_default' => $order->shipping->is_default,
                    ] : null,

                    // Chi tiết sản phẩm
                    'items' => $order->items->map(function ($item) {
                        return [
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'subtotal' => $item->quantity * $item->price,
                            'product' => [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                                'thumbnail' => (string) $item->product->thumbnail,
                            ],
                            'variant' => $item->variant ? [
                                'id' => $item->variant->id,
                                'size' => $item->variant->size->size,
                                'color' => $item->variant->color->color,
                            ] : null
                        ];
                    }),

                    // Thông tin thanh toán và URL ZaloPay
                    'payment' => $order->payment ? [
                        'method' => $order->payment->method->name,
                        'status' => $order->payment->status,
                        'payment_url' => $this->getPaymentUrl($order)
                    ] : null,
                ];
            }),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'next_page_url' => $orders->nextPageUrl(),
                'prev_page_url' => $orders->previousPageUrl(),
            ],
            'filters' => [
                'status' => $status,
                'search' => $search
            ]
        ]);
    }

    // Helper method để lấy payment URL
    private function getPaymentUrl($order)
    {
        if (!$order->payment) {
            return null;
        }

        // Kiểm tra nếu là ZaloPay (giả sử method_id = 1 là ZaloPay)
        if ($order->payment->method_id == 1) {
            // Trả về URL nếu có, không cần kiểm tra trạng thái
            return $order->payment->url;
        }

        return null;
    }

    public function store(OrderStoreRequest $request)
    {
        DB::beginTransaction();

        try {
            // 1. Tính toán tổng giá trị ban đầu và kiểm tra tồn kho
            $originalTotal = 0;
            $items = [];
            $lockedProducts = [];
            $lockedVariants = [];

            foreach ($request->items as $item) {
                // Lock sản phẩm để tránh race condition
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $lockedProducts[] = $product;
                $variant = null;

                // Kiểm tra nếu sản phẩm có biến thể
                if (isset($item['variant_id'])) {
                    // Lock variant để tránh race condition
                    $variant = ProductVariant::lockForUpdate()->findOrFail($item['variant_id']);
                    $lockedVariants[] = $variant;

                    if ($variant->quantity < $item['quantity']) {
                        throw new \Exception("Product {$product->name} ({$variant->size->size}/{$variant->color->color}) only has {$variant->quantity} items left");
                    }
                    $price = $product->promotional_price ?? $product->price;

                } else {
                    // Nếu không có biến thể, kiểm tra số lượng sản phẩm trực tiếp
                    if ($product->stock_quantity < $item['quantity']) {
                        throw new \Exception("Product {$product->name} only has {$product->stock_quantity} items left");
                    }
                    $price = $product->promotional_price ?? $product->price;
                }

                $itemTotal = $price * $item['quantity'];
                $originalTotal += $itemTotal;

                $items[] = [
                    'variant_id' => $item['variant_id'] ?? null,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'variant' => $variant,
                    'product' => $product
                ];
            }

            // 2. Xử lý mã giảm giá
            $discountAmount = 0;
            $discountCode = null;
            if ($request->has('discount_code')) {
                $discountValidation = $this->validateDiscount(
                    $request->discount_code,
                    $originalTotal,
                    array_column($items, 'product_id'),
                    $items
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

            // Xử lý đặc biệt cho đơn hàng 0 đồng
            if ($finalTotal <= 0) {
                $finalTotal = 0; // Đảm bảo không âm
                $order = Order::create([
                    'user_id' => auth()->user()->id,
                    'total' => $finalTotal,
                    'status' => 'processing', // Chuyển thẳng sang processing vì không cần thanh toán
                    'shipping_id' => $request->shipping_id,
                    'sku' => $this->generateSKU(),
                    'discount_code' => $discountCode,
                    'discount_amount' => $discountAmount,
                    'original_total' => $originalTotal,
                ]);

                // Tạo payment record với trạng thái completed
                OrderPayment::create([
                    'order_id' => $order->id,
                    'method_id' => $request->payment_method_id,
                    'status' => 'success', // Đổi từ 'paid' thành 'success'
                    'url' => null,
                    'amount' => 0
                ]);

                // Tạo order items và cập nhật tồn kho
                foreach ($items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                    ]);

                    // Kiểm tra lại số lượng một lần nữa trước khi cập nhật
                    if ($item['variant_id']) {
                        $variant = $item['variant'];
                        // Kiểm tra lại lần cuối để đảm bảo số lượng vẫn đủ
                        if ($variant->quantity < $item['quantity']) {
                            throw new \Exception("Sản phẩm {$item['product']->name} đã hết hàng trong quá trình xử lý");
                        }
                        $variant->decrement('quantity', $item['quantity']);
                        $product->decrement('stock_quantity', $item['quantity']);
                    } else {
                        $product = $item['product'];
                        // Kiểm tra lại lần cuối để đảm bảo số lượng vẫn đủ
                        if ($product->stock_quantity < $item['quantity']) {
                            throw new \Exception("Sản phẩm {$product->name} đã hết hàng trong quá trình xử lý");
                        }
                        $product->decrement('stock_quantity', $item['quantity']);
                    }
                }

                // Cập nhật số lượt sử dụng mã giảm giá
                if ($discountCode) {
                    Discount::where('code', $discountCode)->increment('used_count');
                }

                // Gửi email xác nhận đơn hàng
                Mail::to(auth()->user()->email)->queue(new OrderCreated($order));

                DB::commit();
                event(new NewOrderCreated($order->id));

                // Tạo thông báo cho user
                Notification::create([
                    'user_id' => auth()->id(),
                    'order_id' => $order->id,
                    'title' => 'New Order',
                    'message' => "Order #{$order->sku} has been created successfully",
                    'type' => 'order'
                ]);

                return response()->json([
                    'order' => $order->load(['items.product', 'items.variant.size', 'items.variant.color', 'shipping']),
                    'payment_url' => null,
                    'original_total' => $originalTotal,
                    'discount_amount' => $discountAmount,
                    'final_total' => $finalTotal,
                    'message' => 'Order has been created successfully'
                ], 201);
            }

            // Kiểm tra phương thức thanh toán
            $paymentMethod = PaymentMethod::findOrFail($request->payment_method_id);
            $isCOD = $paymentMethod->id === 2;

            // Làm tròn các giá trị tiền
            $originalTotal = round($originalTotal);
            $discountAmount = round($discountAmount);
            $finalTotal = round($originalTotal - $discountAmount);

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

            // 5. Tạo chi tiết đơn hàng và cập nhật tn kho
            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                // Kiểm tra lại số lượng một lần nữa trước khi cập nhật
                if ($item['variant_id']) {
                    $variant = $item['variant'];
                    // Kiểm tra lại lần cuối để đảm bảo số lượng vẫn đủ
                    if ($variant->quantity < $item['quantity']) {
                        throw new \Exception("Sản phẩm {$item['product']->name} đã hết hàng trong quá trình xử lý");
                    }
                    $variant->decrement('quantity', $item['quantity']);
                } else {
                    $product = $item['product'];
                    // Kiểm tra lại lần cuối để đảm bảo số lượng vẫn đủ
                    if ($product->stock_quantity < $item['quantity']) {
                        throw new \Exception("Sản phẩm {$product->name} đã hết hàng trong quá trình xử lý");
                    }
                    $product->decrement('stock_quantity', $item['quantity']);
                }
            }

            // 6. Tạo bản ghi thanh toán với trạng thái tương ứng
            $payment = OrderPayment::create([
                'order_id' => $order->id,
                'method_id' => $request->payment_method_id,
                'status' => $this->determinePaymentStatus($finalTotal, $isCOD),
                'url' => null,
                'amount' => $finalTotal,
            ]);

            // 7. Xử lý tiếp theo dựa trên phương thức thanh toán
            if ($isCOD || $finalTotal == 0) {
                // Cập nhật số lượt sử dụng mã giảm giá nếu có
                if ($discountCode) {
                    Discount::where('code', $discountCode)->increment('used_count');
                }

                // Gửi email xác nhận đơn hàng qua queue
                Mail::to(auth()->user()->email)->queue(new OrderCreated($order));

                DB::commit();
                event(new NewOrderCreated($order->id));

                // Tạo thông báo cho user
                Notification::create([
                    'user_id' => auth()->id(),
                    'order_id' => $order->id,
                    'title' => 'New Order',
                    'message' => "Order #{$order->sku} has been created successfully",
                    'type' => 'order'
                ]);

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

                // Cập nhật URL thanh toán và app_trans_id vào payment
                $payment->update([
                    'url' => $payment_url,
                    'app_trans_id' => $paymentResponse['app_trans_id'] ?? null
                ]);

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

                // Tạo thông báo cho user
                Notification::create([
                    'user_id' => auth()->id(),
                    'order_id' => $order->id,
                    'title' => 'New Order',
                    'message' => "Order #{$order->sku} has been created successfully",
                    'type' => 'order'
                ]);

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
                'error' => 'Failed to create order',
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
        if ($finalTotal <= 0) {
            return 'processing'; // Đơn 0 đồng chuyển thẳng sang processing
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
        // Làm tròn số tiền về số nguyên và chuyển đổi sang xu
        $amount = round($order->total); // Làm tròn để bỏ phần thập phân

        $paymentRequest = new Request([
            'order_id' => $order->sku,
            'amount' => (int) $amount, // Không cần nhân 100 nữa vì ZaloPay đã tính theo VND
        ]);

        $response = $this->zaloPaymentController->paymentZalo($paymentRequest);
        return json_decode($response->getContent(), true);
    }

    private function determinePaymentStatus($finalTotal, $isCOD)
    {
        if ($finalTotal <= 0) {
            return 'success'; // Đơn 0 đồng đánh dấu đã thanh toán
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
        $order->update(['status' => 'cancelled']);
        $order->payment()->update(['status' => 'failed']);

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
                        $orderPayment->update(['status' => 'success']);
                        break;
                    case 'cancelled':
                        $orderPayment->update(['status' => 'failed']);
                        // Hoàn trả số lượng sản phẩm và mã giảm giá nếu đơn bị hủy
                        if ($prevStatus != 'cancelled') {
                            $this->handleFailedPayment($order);
                        }
                        break;
                    case 'expired':
                        $orderPayment->update(['status' => 'expired']);
                        if ($prevStatus != 'expired' && $prevStatus != 'cancelled') {
                            $this->handleFailedPayment($order);
                        }
                        break;
                    case 'shipping':
                        $orderPayment->update(['status' => 'pending']);
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
                'error' => 'Failed to update order',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function renewPaymentLink($id)
    {
        try {
            DB::beginTransaction();

            // Tìm đơn hàng của user hiện tại
            $order = Order::when(!auth()->user()->role == 'admin' || !auth()->user()->role == 'super-admin', function ($query) {
                $query->where('user_id', auth()->id());
            })
                ->where('id', $id)
                ->firstOrFail();

            // Kiểm tra trạng thái đơn hàng - mở rộng các trạng thái hợp lệ
            $validStatuses = ['failed', 'cancelled', 'expired'];
            if (!in_array($order->status, $validStatuses)) {
                throw new \Exception('This order is not supported to renew payment link');
            }

            // Kiểm tra phương thức thanh toán
            $payment = $order->payment;
            if (!$payment || $payment->method_id == 2) {
                throw new \Exception('This order is not supported to renew payment link');
            }

            // Tạo SKU mới cho giao dịch mới
            $newSku = $this->generateSKU();

            // Lưu SKU cũ vào trường meta hoặc log nếu cần thiết
            $oldSku = $order->sku;
            Log::info("Renewing payment for order: Old SKU: {$oldSku}, New SKU: {$newSku}");

            // Cp nhật SKU mới cho đơn hàng
            $order->update(['sku' => $newSku]);

            // Khởi tạo request cho ZaloPay với số tiền đã được chuyển đổi sang xu
            $paymentRequest = new Request([
                'order_id' => $newSku,
                'amount' => $order->total * 100,
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

            if (!$user->role == 'admin' && !$user->role == 'super-admin' && $order->user_id !== $user->id) {
                throw new \Exception('Bạn không có quyền truy cập đơn hàng này');
            }

            $order->load([
                'user:id,name,email',
                'shipping:id,user_id,shipping_detail,is_default',
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
                        'phone' => $order->user->phone,
                    ],

                    // Thông tin địa chỉ giao hàng
                    'shipping' => $order->shipping ? [
                        'id' => $order->shipping->id,
                        'shipping_detail' => $order->shipping->shipping_detail,
                        'is_default' => $order->shipping->is_default,
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
                                'id'=> $item->product->id,
                                'name' => $item->product->name,
                                'thumbnail' => (string) $item->product->thumbnail,
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

    protected function validateDiscount($code, $total, $productIds, $items)
    {
        try {
            // Tìm mã giảm giá
            $discount = Discount::with('products')
                ->where('code', $code)
                ->where('valid_from', '<=', now())
                ->where('valid_to', '>=', now())
                ->first();

            if (!$discount) {
                return [
                    'status' => false,
                    'message' => 'Invalid or expired discount code'
                ];
            }

            // Kiểm tra số lần sử dụng
            if ($discount->usage_limit > 0 && $discount->used_count >= $discount->usage_limit) {
                return [
                    'status' => false,
                    'message' => 'Discount code has reached usage limit'
                ];
            }

            // Kiểm tra giá trị đơn hàng tối thiểu
            if ($discount->min_order_amount && $total < $discount->min_order_amount) {
                return [
                    'status' => false,
                    'message' => sprintf(
                        'Minimum order amount must be %s to use this code',
                        number_format($discount->min_order_amount, 0, ',', '.')
                    )
                ];
            }

            // Kiểm tra sản phẩm áp dụng
            $discountProducts = $discount->products;
            if ($discountProducts->isNotEmpty()) {
                // Tính tổng giá trị các sản phẩm được áp dụng giảm giá
                $applicableTotal = 0;
                $hasValidProduct = false;

                foreach ($items as $item) {
                    $product = Product::find($item['product_id']);
                    if (!$product)
                        continue;

                    // Kiểm tra xem sản phẩm có trong danh sách được giảm giá không
                    if ($discountProducts->contains('id', $product->id)) {
                        $hasValidProduct = true;

                        // Xử lý giá dựa trên variant nếu có
                        if (isset($item['variant_id'])) {
                            $variant = ProductVariant::find($item['variant_id']);
                            if ($variant) {
                                $price = $product->promotional_price ?? $product->price;
                            }
                        } else {
                            $price = $product->promotional_price ?? $product->price;
                        }

                        $applicableTotal += $price * $item['quantity'];
                    }
                }

                if (!$hasValidProduct) {
                    return [
                        'status' => false,
                        'message' => 'Discount code is only applicable to certain products'
                    ];
                }

                // Tính số tiền giảm dựa trên tổng giá trị sản phẩm được áp dụng
                $discountAmount = ($applicableTotal * $discount->percent) / 100;
            } else {
                // Nếu không có sản phẩm cụ thể, áp dụng giảm giá cho toàn bộ đơn hàng
                $discountAmount = ($total * $discount->percent) / 100;
            }

            return [
                'status' => true,
                'discount' => $discount,
                'discount_amount' => $discountAmount,
                'message' => 'Discount code applied successfully'
            ];

        } catch (\Exception $e) {
            Log::error('Lỗi xử lý mã giảm giá: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Lỗi khi xử lý mã giảm giá: ' . $e->getMessage()
            ];
        }
    }

}
