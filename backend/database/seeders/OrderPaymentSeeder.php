<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class OrderPaymentSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $orders = Order::all();

        // Lấy tất cả payment method IDs hiện có
        $paymentMethodIds = PaymentMethod::pluck('id')->toArray();

        foreach ($orders as $order) {
            DB::table('order_payments')->insert([
                'order_id' => $order->id,
                'method_id' => $faker->randomElement($paymentMethodIds), // Chọn ngẫu nhiên từ các ID có sẵn
                'status' => $faker->randomElement(['pending', 'processing', 'success']),
                'url' => $faker->url(),
                'app_trans_id' => 'APP' . $faker->bothify('##########'),
                'zp_trans_id' => 'ZP' . $faker->bothify('##########'),
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ]);
        }
    }
}
