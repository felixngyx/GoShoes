<?php

namespace App\Http\Controllers\API\Order;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\ProductVariant;
use App\Http\Controllers\API\Payments\ZaloPaymentController;
use App\Http\Requests\Order\OrderStoreRequest;
use App\Http\Requests\Order\UpdateOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    protected $zaloPaymentController;

    public function __construct(ZaloPaymentController $zaloPaymentController)
    {
        $this->zaloPaymentController = $zaloPaymentController;
    }

    public function index()
    {
        $orders = Order::with(['items.product', 'items.variant.size', 'items.variant.color', 'shipping', 'payment.method'])
            ->where('user_id', auth()->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($orders);
    }

    public function store(OrderStoreRequest $request)
    {
        DB::beginTransaction();

        try {
            $order = Order::create([
                'user_id' => auth()->user()->id,
                'total' => $request->total,
                'status' => 'pending',
                'shipping_id' => $request->shipping_id,
                'sku' => $this->generateSKU(),
            ]);

            foreach ($request->items as $item) {
                $variant = ProductVariant::findOrFail($item['variant_id']);
                $product = $variant->product;

                if ($variant->quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product variant: " . $product->name);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                    'price' => $product->promotional_price ?? $product->price,
                ]);

                // Decrease the stock quantity
                $variant->decrement('quantity', $item['quantity']);
            }

            $payment = OrderPayment::create([
                'order_id' => $order->id,
                'method_id' => $request->payment_method_id,
                'status' => 'pending',
            ]);

            // Initiate payment process
            // Initiate payment process
            $paymentResponse = $this->initiatePayment($order);

            // Kiểm tra phản hồi từ ZaloPay
            if (isset($paymentResponse['return_code']) && $paymentResponse['return_code'] == 1) {
                // Lưu URL để thanh toán
                $payment_url = $paymentResponse['order_url']; // Sử dụng 'order_url' thay vì 'orderurl'

                DB::commit();

                return response()->json([
                    'order' => $order->load(['items.product', 'items.variant.size', 'items.variant.color', 'shipping', 'payment.method']),
                    'payment_url' => $payment_url, // Trả về URL thanh toán
                ], 201);
            } else {
                // Nếu không có 'return_code' hoặc 'return_code' không phải là 1
                throw new \Exception('Payment initiation failed: ' . json_encode($paymentResponse));
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Order creation failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'items.variant.size', 'items.variant.color', 'shipping', 'payment.method'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json($order);
    }

    public function update(UpdateOrderRequest $request, $id)
    {
        $order = Order::where('user_id', Auth::id())->findOrFail($id);

        $order->update($request->only(['status']));

        if ($request->status === 'cancelled') {
            foreach ($order->items()->get() as $item) {
                $item->variant()->increment('quantity', $item->quantity);
            }
        }

        return response()->json($order);
    }

    protected function generateSKU()
    {
        $prefix = 'ORD';
        $timestamp = now()->format('YmdHis');
        $random = str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
        return $prefix . $timestamp . $random;
    }

    protected function initiatePayment(Order $order)
    {
        $paymentRequest = new Request([
            'order_id' => $order->sku,
            'amount' => $order->total * 100, // Chuyển đổi sang đơn vị xu
        ]);

        $response = $this->zaloPaymentController->paymentZalo($paymentRequest);

        // Kiểm tra và truy cập dữ liệu từ response
        $responseData = json_decode($response->getContent(), true);

        return $responseData;
    }

    public function checkPaymentStatus($id)
    {
        $order = Order::where('user_id', Auth::id())->findOrFail($id);
        $payment = $order->payment;

        if (!$payment) {
            return response()->json(['error' => 'Payment not found for this order'], 404);
        }

        $paymentRequest = new Request([
            'app_trans_id' => $payment->id,
        ]);

        $paymentStatus = $this->zaloPaymentController->searchStatus($paymentRequest);

        // Cập nhật trạng thái đơn hàng và thanh toán dựa trên phản hồi
        $this->updateOrderStatus($order, $paymentStatus);

        return response()->json([
            'order_status' => $order->status,
            'payment_status' => $payment->status,
            'zalopay_response' => $paymentStatus,
        ]);
    }

    protected function updateOrderStatus(Order $order, $paymentStatus)
    {
        if ($paymentStatus['return_code'] == 1) {
            $order->update(['status' => 'processing']);
            $order->payment()->update(['status' => 'completed']);
        } elseif ($paymentStatus['return_code'] == 2) {
            $order->update(['status' => 'pending']);
            $order->payment()->update(['status' => 'pending']);
        } else {
            $order->update(['status' => 'cancelled']);
            $order->payment()->update(['status' => 'failed']);
        }
    }
}
