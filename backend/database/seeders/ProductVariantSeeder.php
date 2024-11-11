<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductVariant;

class ProductVariantSeeder extends Seeder
{
    public function run()
    {
        // Giả sử bạn có 20 san pham  sản phẩm, 6 màu, 5 size
        for ($i = 1; $i <= 5; $i++) { // Id sản phẩm
            for ($color_id = 1; $color_id <= 3; $color_id++) { 
                for ($size_id = 1; $size_id <= 4; $size_id++) { 
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
