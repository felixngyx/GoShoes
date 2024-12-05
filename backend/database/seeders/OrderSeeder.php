<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        foreach (range(1, 10) as $index) {
            DB::table('orders')->insert([
                'user_id' => rand(1, 5),
                'total' => $faker->randomFloat(2, 50, 500), // Tổng tiền từ 50 đến 500
                'status' => $faker->randomElement(['pending', 'processing', 'completed', 'cancelled']),
                'sku' => strtoupper($faker->bothify('ORD###??')), // Tạo mã đơn hàng ngẫu nhiên
                'shipping_id' => rand(1, 3), // Giả sử có 10 bản ghi trong bảng shipping
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
