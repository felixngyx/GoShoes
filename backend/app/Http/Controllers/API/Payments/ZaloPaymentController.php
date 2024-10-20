<?php

namespace App\Http\Controllers\API\Payments;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ZaloPaymentController extends Controller
{
    private $config = [
        "app_id" => 2554,
        "key1" => "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
        "key2" => "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
        "endpoint" => "https://sb-openapi.zalopay.vn/v2/create",
    ];

    public function __construct() {}
    public function paymentZalo(Request $request)
    {

        $order_id = "8QHABD";



        $embeddata = [
            "redirecturl" => "http://localhost:8000/api/payment/callback",
        ];

        $embeddatafinal = json_encode($embeddata);

        $items = '[]';

        $transID = $order_id;
        $order = [
            "app_id" => $this->config["app_id"],
            "app_time" => round(microtime(true) * 1000), // miliseconds
            "app_trans_id" => date("ymd") . "_" . $transID, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
            "app_user" => "",
            "item" => $items,
            "embed_data" => $embeddatafinal,
            "amount" => 50000,
            "description" => "GoShoes - Payment for the order #$transID",
            "bank_code" => "",
            "callback_url" => env('NRGOK_URL' . '/api/payment/callback', ''),
        ];

        $data = $order["app_id"] . "|" . $order["app_trans_id"] . "|" . $order["app_user"] . "|" . $order["amount"]
            . "|" . $order["app_time"] . "|" . $order["embed_data"] . "|" . $order["item"];
        $order["mac"] = hash_hmac("sha256", $data,  $this->config["key1"]);

        $context = stream_context_create([
            "http" => [
                "header" => "Content-type: application/x-www-form-urlencoded\r\n",
                "method" => "POST",
                "content" => http_build_query($order)
            ]
        ]);

        $resp = file_get_contents($this->config['endpoint'], false, $context);
        $result = json_decode($resp, true);
        return response()->json($result);
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

        //if return_code = 1 thì redirect về frontend với message "transaction successful"
        if ($result["return_code"] == 1) {
            return redirect()->away(env('FRONTEND_URL') . '/payment-success?message=Transaction successful');
        }
        // nếu return_code = 0 thì redirect về frontend với message "Thanh toán thất bại"
        if ($result["return_code"] == 0) {
            return redirect()->away(env('FRONTEND_URL') . '/payment-fail?message=Transaction failed');
        }
        // nếu return_code = -1 thì redirect về frontend với message "Checksum verification failed"
        if ($result["return_code"] == -1) {
            return redirect()->away(env('FRONTEND_URL') . '/payment-fail?message=Checksum verification failed');
        }
    }

    public function searchStatus(Request $request)
    {
        $enpointSearch = "https://sb-openapi.zalopay.vn/v2/query";
        $request->validate([
            'app_trans_id' => 'required|string',
        ]);

        $app_trans_id = $request->input('app_trans_id');

        $data = $this->config["app_id"] . "|" . $app_trans_id . "|" . $this->config["key1"];

        $params = [
            "app_id" => $this->config["app_id"],
            "app_trans_id" => $app_trans_id,
            "mac" => hash_hmac("sha256", $data, $this->config["key1"])
        ];

        $response = Http::asForm()->post($enpointSearch, $params);

        if ($response->successful()) {
            $result = $response->json();
            return response()->json($result);
        } else {
            return response()->json([
                'error' => 'Failed to query transaction',
                'details' => $response->body()
            ], $response->status());
        }
    }

    public function batchSearchStatus(Request $request)
    {
        $endpointSearch = "https://sb-openapi.zalopay.vn/v2/query";

        $request->validate([
            'app_trans_ids' => 'required|array',
            'app_trans_ids.*' => 'string',
        ]);

        $app_trans_ids = $request->input('app_trans_ids');
        $results = [];

        foreach ($app_trans_ids as $app_trans_id) {
            $data = $this->config["app_id"] . "|" . $app_trans_id . "|" . $this->config["key1"];

            $params = [
                "app_id" => $this->config["app_id"],
                "app_trans_id" => $app_trans_id,
                "mac" => hash_hmac("sha256", $data, $this->config["key1"])
            ];

            $response = Http::asForm()->post($endpointSearch, $params);

            if ($response->successful()) {
                $results[$app_trans_id] = $response->json();
            } else {
                $results[$app_trans_id] = [
                    'error' => 'Failed to query transaction',
                    'details' => $response->body()
                ];
            }
        }

        return response()->json($results);
    }
}
