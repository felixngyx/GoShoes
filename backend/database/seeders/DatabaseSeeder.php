<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            BrandSeeder::class,
            ColorSeeder::class,
            SizeSeeder::class,
            ProductSeeder::class,
            ProductVariantSeeder::class,
            CategorySeeder::class,
            ProductCategorySeeder::class,
            ProductImageSeeder::class,
            PaymentMethodsSeeder::class,
            UserSeeder::class,
            ShippingSeeder::class,
        ]);
    }
}