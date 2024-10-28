<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductVariant;

class ProductVariantSeeder extends Seeder
{
    public function run()
    {
        // Giả sử bạn có 10 sản phẩm, 6 màu, 5 size
        for ($i = 1; $i <= 20; $i++) { // Id sản phẩm
            for ($color_id = 1; $color_id <= 6; $color_id++) { // id màu
                for ($size_id = 1; $size_id <= 5; $size_id++) { // id size
                    ProductVariant::create([
                        'product_id' => $i, // Id sản phẩm
                        'color_id' => $color_id, // Id màu
                        'size_id' => $size_id, // Id size
                        'quantity' => rand(10, 100), // Số lượng tồn kho
                        'image_variant' => 'https://placehold.co/600x400', // Tên hình ảnh sản phẩm
                    ]);
                }
            }
        }
    }
}
