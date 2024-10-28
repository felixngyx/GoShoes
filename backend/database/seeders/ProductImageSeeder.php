<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductImage;

class ProductImageSeeder extends Seeder
{
    public function run()
    {
        // Giả sử mỗi sản phẩm có 3 hình ảnh
        for ($i = 1; $i <= 20; $i++) {
            for ($j = 1; $j <= 3; $j++) {
                ProductImage::create([
                    'product_id' => $i, // Id sản phẩm
                    'image_path' => 'https://placehold.co/600x400', // Đường dẫn hình ảnh
                ]);
            }
        }
    }
}
