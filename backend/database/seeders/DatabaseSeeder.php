<?php

namespace Database\Seeders;

use App\Models\ImageVariant;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run()
    {
        // Upsert dữ liệu cho các bảng
        \App\Models\Category::factory()->upsertCategories(10);
        \App\Models\Brand::factory()->upsertBrands(10);
        \App\Models\Product::factory()->upsertProducts(10);
        \App\Models\VariantColor::factory()->upsertVariantColors(5);
        \App\Models\VariantSize::factory()->upsertVariantSizes(5);
        \App\Models\ImageVariant::factory()->upsertImageVariants(20);
        \App\Models\ProductVariant::factory()->upsertProductVariants(20);
        \App\Models\VariantSize::factory()->upsertVariantSizes(30);
        // $this->call([
        //     UserSeeder::class,
        //     BrandSeeder::class,
        //     ColorSeeder::class,
        //     SizeSeeder::class,
        //     ProductSeeder::class,
        //     CategorySeeder::class,
        //     ProductCategorySeeder::class,
        //     ProductImageSeeder::class,
        //     ImageVariantSeeder::class,
        //     ProductVariantSeeder::class,
        //     ShippingSeeder::class,
        // ]);
    }
}
