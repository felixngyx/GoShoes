<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductVariant;

class ProductVariantSeeder extends Seeder
{
    public function run()
    {
        // Giả sử bạn có 10 sản phẩm, 6 màu, 5 size
        for ($i = 1; $i <= 30; $i++) { // Id sản phẩm
            for ($color_id = 1; $color_id <= 6; $color_id++) { // id màu
                for ($size_id = 1; $size_id <= 5; $size_id++) { // id size
                    ProductVariant::create([
                        'product_id' => $i, // Id sản phẩm
                        'color_id' => $color_id, // Id màu
                        'size_id' => $size_id, // Id size
                        'quantity' => rand(10, 100), // Số lượng tồn kho
                        'image_variant' => 'variant_'. $i . '_'. $color_id . '_'. $size_id. '.jpg', // Tên hình ảnh sản phẩm
                    ]);
                }
            }
        }
    }
}
