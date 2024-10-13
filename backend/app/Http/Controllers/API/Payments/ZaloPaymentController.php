<?php

namespace App\Http\Controllers\API\Payments;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;

class ZaloPaymentController extends Controller
{
    private $config = [
        "app_id" => 2554,
        "key1" => "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
        "key2" => "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
        "endpoint" => "https://sb-openapi.zalopay.vn/v2/create",
    ];

    public function __construct() {}
    public function paymentMomo(Request $request)
    {
        
        $order_id = "HTE-102";



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
            "callback_url" => env('NRGOK_URL'.'/api/payment/callback', ''),
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

        // dd($order);

        $resp = file_get_contents($this->config['endpoint'], false, $context);
        $result = json_decode($resp, true);
        return response()->json($result);
    }

//     public function callback(Request $request)
// {
//     $result = [];

//     try {
//         $key2 = $this->config["key2"];
//         // Post data from lấy trên đưong dẫn callback
//         // $postdata = ;
//         $postdatajson = json_decode($postdata, true);
//         $mac = hash_hmac("sha256", $postdatajson["data"], $key2);
      
//         $requestmac = $postdatajson["mac"];
      
//         // kiểm tra callback hợp lệ (đến từ ZaloPay server)
//         if (strcmp($mac, $requestmac) != 0) {
//           // callback không hợp lệ
//           $result["return_code"] = -1;
//           $result["return_message"] = "mac not equal";
//         } else {
//           // thanh toán thành công
//           // merchant cập nhật trạng thái cho đơn hàng
//           $datajson = json_decode($postdatajson["data"], true);
//           // echo "update order's status = success where app_trans_id = ". $dataJson["app_trans_id"];
      
//           $result["return_code"] = 1;
//           $result["return_message"] = "success";
//         }
//       } catch (Exception $e) {
//         $result["return_code"] = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
//         $result["return_message"] = $e->getMessage();
//       }
//     return response()->json($result);

// }
}
