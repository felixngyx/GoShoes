<?php

namespace App\Http\Controllers\API\Order;

use App\Http\Controllers\API\Payments\ZaloPaymentController;
use App\Http\Controllers\Controller;
use App\Http\Requests\RefundRequestStore;
use App\Mail\SendMailApprove;
use App\Mail\SendMailDeny;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\RefundRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Mail;
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
        $refundRequests = RefundRequest::orderBy('id', 'desc')->get();

        return response()->json([
            'status' => true,
            'refund_requests' => $refundRequests
        ]);
    }


    public function viewDetailRefundRequest($id)
    {
        $refundRequest = RefundRequest::with([
            'order' => function ($query) {
                $query->with(['items.product', 'items.variant', 'payment', 'user']);
            }
        ])->find($id);

        if (!$refundRequest) {
            return response()->json([
                'status' => false,
                'message' => 'Yêu cầu hoàn tiền không tồn tại'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'refund_request' => $refundRequest
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
            Log::error('Error when refund request: ' . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Have an error when refund request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request)
    {
        try {
            DB::beginTransaction();
            $refundRequest = RefundRequest::find($request->id);
            if (!$refundRequest) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy yêu cầu hoàn tiền'
                ], 404);
            }


            // Tìm đơn hàng
            $order = Order::find($refundRequest->order_id);
            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            // Lấy thông tin thanh toán
            $orderPayment = $order->payment;
            if (!$orderPayment) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy thông tin thanh toán'
                ], 404);
            }
            Mail::to($order->user->email)->send(new SendMailApprove(
                $order->user->name,
                $order->id,
                $order->total
            ));
            $order->update(['status' => 'refunded']);
            $refundRequest->update(['status' => 'approved']);

            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Đã phê duyệt hoàn tiền thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xử lý hoàn tiền: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deny(Request $request)
    {
        try {
            DB::beginTransaction();
            $refundRequest = RefundRequest::find($request->id);
            
            if (!$refundRequest) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy yêu cầu hoàn tiền'
                ], 404);
            }

            // Tìm đơn hàng
            $order = Order::find($refundRequest->order_id);
            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            // Lấy thông tin thanh toán
            $orderPayment = $order->payment;
            if (!$orderPayment) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy thông tin thanh toán'
                ], 404);
            }
            Mail::to($order->user->email)->send(new SendMailDeny(
                $order->user->name,
                $order->id,
                $order->total
            ));
            $refundRequest->update(['status' => 'rejected']);
            
            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Đã từ chối yêu cầu hoàn tiền'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xử lý từ chối hoàn tiền: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getRefundStatistics()
    {
        try {
            $totalRefunds = RefundRequest::count();
            $approvedRefunds = RefundRequest::where('status', 'approved')->count();
            $pendingRefunds = RefundRequest::where('status', 'pending')->count();
            $rejectedRefunds = RefundRequest::where('status', 'rejected')->count();

            $statistics = [
                'approved_percentage' => $totalRefunds > 0 ? round(($approvedRefunds / $totalRefunds) * 100, 2) : 0,
                'pending_percentage' => $totalRefunds > 0 ? round(($pendingRefunds / $totalRefunds) * 100, 2) : 0,
                'rejected_percentage' => $totalRefunds > 0 ? round(($rejectedRefunds / $totalRefunds) * 100, 2) : 0,
                'total_requests' => $totalRefunds
            ];

            return response()->json([
                'status' => true,
                'statistics' => $statistics
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting refund statistics: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error getting refund statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
