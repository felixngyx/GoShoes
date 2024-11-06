<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        foreach (range(1, 30) as $index) {
            DB::table('order_items')->insert([
                'order_id' => rand(1, 10), // Giả sử có 10 đơn hàng trong bảng orders
                'product_id' => rand(1, 10), // Giả sử có 10 sản phẩm trong bảng products
                'price' => $faker->randomFloat(2, 10, 100), // Giá từ 10 đến 100
                'quantity' => rand(1, 5),
                'variant_id' => rand(1, 5), // Giả sử có 5 biến thể
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
