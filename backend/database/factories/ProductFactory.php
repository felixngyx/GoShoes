<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition()
    {
        $imageUrls = file('database/factories/test.txt', FILE_IGNORE_NEW_LINES);
        $randomImageUrl = trim($imageUrls[array_rand($imageUrls)]);
        $tenGiay = $this->faker->randomElement([
            $this->faker->randomElement(['Nike', 'Adidas', 'Converse', 'Vans']) . ' ' . $this->faker->word()
        ]);
        $price = $this->faker->randomFloat(2, 50, 500) * $this->faker->randomFloat(1, 0.8, 1.2) *1000;

        return [
            'sku' => Str::upper(Str::random(10)),
            'name' => $tenGiay,
            'description' => $this->faker->sentence,
            'price' => $price,
            'brand_id' => rand(1, 10),
            'stock_quantity' => rand(10, 100),
            'promotional_price' => $this->faker->randomFloat(2, 30, min($price - 10, 150)) * 1000,
            'status' => 'public',
            'is_deleted' => false,
            'rating_count' => rand(1, 5),
            'slug' => Str::slug($this->faker->word),
            'thumbnail' => $randomImageUrl,
            'hagtag' => '#sample #product',
        ];
    }

    public function upsertProducts(int $count)
    {
        $products = [];
        for ($i = 0; $i < $count; $i++) {
            $products[] = $this->definition();
        }

        Product::upsert($products, ['sku'], ['name', 'brand_id', 'description', 'price', 'stock_quantity', 'promotional_price', 'status', 'is_deleted', 'rating_count', 'slug', 'thumbnail', 'hagtag']);
    }
}
