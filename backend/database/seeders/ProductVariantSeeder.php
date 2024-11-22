<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductVariant;

class ProductVariantSeeder extends Seeder
{
    public function run()
    {
        // Định nghĩa rõ ràng các giá trị
        $totalProducts = 5;
        $totalColors = 3;
        $totalSizes = 4;

        // Sử dụng collection để tối ưu performance
        $variants = collect();

        for ($productId = 1; $productId <= $totalProducts; $productId++) {
            for ($colorId = 1; $colorId <= $totalColors; $colorId++) {
                for ($sizeId = 1; $sizeId <= $totalSizes; $sizeId++) {
                    $variants->push([
                        'product_id' => $productId,
                        'color_id' => $colorId,
                        'size_id' => $sizeId,
                        'quantity' => rand(10, 100),
                        // 'image_variant' => 'https://placehold.co/600x400',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Insert chunk để tối ưu performance
        foreach ($variants->chunk(100) as $chunk) {
            ProductVariant::insert($chunk->toArray());
        }
    }
}
