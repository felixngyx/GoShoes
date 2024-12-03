<?php

namespace Database\Seeders;

use App\Models\ImageVariant;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run()
    {
        // Upsert dữ liệu cho các bảng
        \App\Models\User::factory()->upsertUser(10);
        \App\Models\Category::factory()->upsertCategories(15);
        \App\Models\Brand::factory()->upsertBrands(10);
        \App\Models\Product::factory()->upsertProducts(100);
        \App\Models\VariantColor::factory()->upsertVariantColors(10);
        \App\Models\VariantSize::factory()->upsertVariantSizes(8);
        \App\Models\ImageVariant::factory()->upsertImageVariants(300);
        \App\Models\ProductVariant::factory()->upsertProductVariants(100);
        \App\Models\VariantSize::factory()->upsertVariantSizes(30);
        \App\Models\PostCategory::factory()->count(10)->create();
        \App\Models\Post::factory()->count(50)->create();
        $this->call(BannerSeeder::class);

        // git
    }
}
