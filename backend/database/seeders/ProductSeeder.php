<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ProductSeeder extends Seeder
{
    public function run()
    {
        // Tạo 10 sản phẩm mẫu với các thông tin khác nhau
        for ($i = 1; $i <= 30; $i++) {
            Product::create([
                'brand_id' => rand(1, 5), // Ví dụ tạo ngẫu nhiên brand_id từ 1 đến 5
                'name' => 'Sample Product ' . $i, // Tên sản phẩm khác nhau cho mỗi vòng lặp
                'description' => 'This is a sample description for product ' . $i . '.',
                'price' => rand(50000, 200000), // Giá ngẫu nhiên trong khoảng từ 50.000 đến 200.000
                'stock_quantity' => rand(10, 100), // Số lượng trong kho ngẫu nhiên từ 10 đến 100
                'promotional_price' => rand(30000, 150000), // Giá khuyến mãi ngẫu nhiên
                'status' => 'public', // Trạng thái sản phẩm
                'sku' => Str::upper(Str::random(10)), // Mã SKU ngẫu nhiên
                'is_deleted' => false,
                'rating_count' => rand(1, 5), // Số đánh giá ngẫu nhiên từ 1 đến 5
                'slug' => Str::slug('Sample Product ' . $i, '-'), // Slug dựa trên tên sản phẩm
                'thumbnail' => 'products/sample-product-' . $i . '.jpg', // Hình ảnh sản phẩm khác nhau
                'hagtag' => '#sample #product' . $i,
                'scheduled_at' => Carbon::now()->addDays(rand(1, 10)), // Ngày lên lịch ngẫu nhiên
                'published_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
