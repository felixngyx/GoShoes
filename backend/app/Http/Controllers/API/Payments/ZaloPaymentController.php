<?php

namespace App\Http\Controllers\API\Payments;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderPayment;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZaloPaymentController extends Controller
{
    private $config = [
        "app_id" => 2554,
        "key1" => "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
        "key2" => "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
        "endpoint" => "https://sb-openapi.zalopay.vn/v2/create",
    ];

    public function paymentZalo(Request $request)
    {
        try {
            $order = Order::where('sku', $request->order_id)->firstOrFail();

            $embeddata = [
                "redirecturl" => 'http://localhost:8000/api/payment/callback',
            ];

            $items = json_encode([]);

            $order_data = [
                "app_id" => $this->config["app_id"],
                "app_time" => round(microtime(true) * 1000),
                "app_trans_id" => date("ymd") . "_" . $order->sku,
                "app_user" => "user" . $order->user_id,
                "item" => $items,
                "embed_data" => json_encode($embeddata),
                "amount" => $request->amount,
                "description" => "Thanh toán đơn hàng #" . $order->sku,
                "bank_code" => "",
                "callback_url" => route('payment.callback'),
            ];

            $data = $order_data["app_id"] . "|" . $order_data["app_trans_id"] . "|" . $order_data["app_user"] . "|" . $order_data["amount"]
                . "|" . $order_data["app_time"] . "|" . $order_data["embed_data"] . "|" . $order_data["item"];
            $order_data["mac"] = hash_hmac("sha256", $data, $this->config["key1"]);

            $response = Http::withOptions(['verify' => false])->post($this->config['endpoint'], $order_data);

            if ($response->successful()) {
                $result = $response->json();
                if ($result['return_code'] == 1) {
                    return response()->json($result); // Đảm bảo trả về đối tượng JSON
                } else {
                    throw new Exception('ZaloPay returned error: ' . $result['return_message']);
                }
            } else {
                Log::error('ZaloPay response: ' . $response->body()); // Ghi lại nội dung phản hồi nếu có lỗi
                throw new Exception('Failed to connect to ZaloPay');
            }
        } catch (Exception $e) {
            Log::error('ZaloPay payment initiation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Payment initiation failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function callback(Request $request)
    {
        $result = [];
        $key2 = $this->config["key2"];

        try {
            // Get all data from the request
            $data = $request->all();

            // Check for required parameters
            $requiredParams = ['amount', 'appid', 'apptransid', 'pmcid', 'bankcode', 'status', 'checksum'];
            foreach ($requiredParams as $param) {
                if (!isset($data[$param])) {
                    throw new Exception("Missing required parameter: $param");
                }
            }

            // Construct the data string for checksum verification
            $checksumData = $data["appid"] . "|" . $data["apptransid"] . "|" . $data["pmcid"] . "|" .
                $data["bankcode"] . "|" . $data["amount"] . "|" .
                ($data["discountamount"] ?? "0") . "|" . $data["status"];

            // Calculate MAC
            $mac = hash_hmac("sha256", $checksumData, $key2);

            // Get the received MAC
            $receivedMac = $data["checksum"];

            // Verify the checksum
            if (strcmp($mac, $receivedMac) !== 0) {
                $result["return_code"] = -1;
                $result["return_message"] = "Checksum verification failed";
                error_log("Calculated MAC: " . $mac);
                error_log("Received MAC: " . $receivedMac);
            } else {
                // Checksum is valid, process the payment
                $result["return_code"] = 1;
                $result["return_message"] = "Success";

                // TODO: Update order status based on the payment result
                // You should implement your order update logic here
                // For example:
                // $this->updateOrderStatus($data["apptransid"], $data["status"]);
            }
        } catch (Exception $e) {
            $result["return_code"] = 0;
            $result["return_message"] = $e->getMessage();
            error_log("ZaloPay Callback Error: " . $e->getMessage());
        }
        $apptrans = strstr($data["apptransid"],'_');

        $sku = ltrim($apptrans,'_');
        if (empty($sku)) {
            return redirect()->away(env('FRONTEND_URL') . '/payment-fail?message=Invalid SKU');
        }

        $order = Order::where("sku", $sku)->first();
        Log::info("". $order->id ."") ;

        if (!$order) {
            return redirect()->away(env('FRONTEND_URL') . '/payment-fail?message=Order not found');
        }
        $order->update(['status' => 'processing']);
        $payment = OrderPayment::where('order_id', $order->id)->first();
        //if return_code = 1 thì redirect về frontend với message "transaction successful"
        if (!$payment) {
            return redirect()->away(env('FRONTEND_URL') . '/payment-fail?message=Payment information not found');
        }

        // Xử lý kết quả thanh toán
        switch ($result["return_code"]) {
            case 1:
                $order->update(["status" => "completed"]);
                $payment->update(['status' => 'success']);
                return redirect()->away(env('FRONTEND_URL') . '/payment-success?message=Transaction successful');

            case 0:
            case -1:
                $order->update(["status" => "cancelled"]);
                $payment->update(['status' => 'failed']);
                $message = ($result["return_code"] == 0) ? 'Transaction failed' : 'Checksum verification failed';
                return redirect()->away(env('FRONTEND_URL') . '/payment-fail?message=' . $message);
        }
    }


    public function searchStatus(Request $request)
    {
        try {
            $payment = OrderPayment::findOrFail($request->app_trans_id);
            $order = $payment->order;

            $data = $this->config["app_id"] . "|" . $order->sku . "|" . $this->config["key1"];

            $params = [
                "app_id" => $this->config["app_id"],
                "app_trans_id" => $order->sku,
                "mac" => hash_hmac("sha256", $data, $this->config["key1"])
            ];

            $response = Http::asForm()->post("https://sb-openapi.zalopay.vn/v2/query", $params);

            if ($response->successful()) {
                $result = $response->json();
                return response()->json($result);
            } else {
                throw new Exception('Failed to query transaction status from ZaloPay');
            }
        } catch (Exception $e) {
            Log::error('ZaloPay status check failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to check payment status', 'message' => $e->getMessage()], 500);
        }
    }

    public function batchSearchStatus(Request $request)
    {
        $request->validate([
            'app_trans_ids' => 'required|array',
            'app_trans_ids.*' => 'string',
        ]);

        $results = [];

        foreach ($request->app_trans_ids as $app_trans_id) {
            $statusRequest = new Request(['app_trans_id' => $app_trans_id]);
            $results[$app_trans_id] = $this->searchStatus($statusRequest)->original;
        }

        return response()->json($results);
    }
}
