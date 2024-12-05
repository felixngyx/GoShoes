<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use App\Models\Product;
use App\Models\ProductVariant;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy tất cả product_id có sẵn
        $productIds = Product::pluck('id')->toArray();

        foreach (range(1, 100) as $index) {
            // Chọn ngẫu nhiên một sản phẩm
            $product_id = $faker->randomElement($productIds);

            // Lấy một variant ngẫu nhiên của sản phẩm đó
            $variant = ProductVariant::where('product_id', $product_id)
                ->inRandomOrder()
                ->first();

            // Lấy giá của sản phẩm
            $product = Product::find($product_id);
            $price = $product->promotional_price ?: $product->price;

            DB::table('order_items')->insert([
                'order_id' => rand(1, 10),
                'product_id' => $product_id,
                'price' => $price,
                'quantity' => rand(1, 5),
                'variant_id' => $variant->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
