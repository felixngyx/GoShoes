<?php

namespace App\Http\Controllers\API\Order;

use App\Http\Controllers\API\Payments\ZaloPaymentController;
use App\Http\Controllers\Controller;
use App\Http\Requests\RefundRequestStore;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\RefundRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpParser\Node\Expr\Throw_;

use function PHPUnit\Framework\throwException;

class RefundController extends Controller
{
    protected $zaloPaymentController;

    public function __construct(ZaloPaymentController $zaloPaymentController)
    {
        $this->zaloPaymentController = $zaloPaymentController;
    }
    public function index()
    {
        $refundRequests = RefundRequest::where('user_id', auth()->id())->get();

        return response()->json([
            'status' => true,
            'refund_requests' => $refundRequests
        ]);
    }

    public function store(RefundRequestStore $request)
    {
        try {
            DB::beginTransaction();

            // Kiểm tra đơn hàng có tồn tại và thuộc về user hiện tại
            $order = Order::where('id', $request->order_id)
                ->where('user_id', auth()->id())
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order is not found or does not belong to you'
                ], 404);
            }

            // Kiểm tra đơn hàng đã có yêu cầu hoàn tiền chưa
            $existingRefund = RefundRequest::where('order_id', $request->order_id)
                ->where('status', '!=', 'rejected')
                ->first();

            if ($existingRefund) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order Refund Request already exists'
                ], 422);
            }

            // Kiểm tra số tiền hoàn có hợp lệ
            if ($request->amount > $order->total_amount) {
                return response()->json([
                    'status' => false,
                    'message' => 'Refund amount is greater than the total amount of the order'
                ], 422);
            }

            // Tạo yêu cầu hoàn tiền
            $refundRequest = RefundRequest::create([
                'user_id' => auth()->id(),
                'order_id' => $request->order_id,
                'reason' => $request->reason,
                'images' => $request->images,
                'status' => 'pending',
                'amount' => $request->amount,
                'description' => $request->description
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Refund Request created successfully',
                'refund_request' => $refundRequest
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error when refund request: ' . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Have an error when refund request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approve($id)
    {
        try {
           
            DB::beginTransaction();
            $order = Order::where('id', $id)->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order is not found'
                ], 404);
            }

            // Access the payment relationship correctly
            $orderPayment = $order->payment;
            $apptransid = $orderPayment->app_trans_id;

            // Fix the payment method comparison
            if ($order->payment_method != 1) {
                $order->update([
                    'status' => 'refunded'
                ]);
                return response()->json([
                    'status'=> true,
                    'message'=> 'Order refunded successfully'
                ]) ;
            }
            $refund = $this->zaloPaymentController->refund($order->id ,$apptransid, $order->total);

            if( $refund->json_decode('status') == 'success'){
                $order->update([
                    'status' => 'refunded'
                ]);
                DB::commit();
                return response()->json([
                    'status'=> true,
                    'message'=> 'Order refunded successfully'
                ]) ;
            }
            

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Order refunded successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error processing refund: ' . $e->getMessage()
            ], 500);
        }
    }
}
