<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductCategory;

class ProductCategorySeeder extends Seeder
{
    public function run()
    {
        // Giả sử có 10 sản phẩm và 5 categories
        for ($i = 1; $i <= 20; $i++) {
            ProductCategory::create([
                'product_id' => $i, // Id sản phẩm
                'category_id' => rand(1, 5), // Id danh mục ngẫu nhiên
            ]);
        }
    }
}
