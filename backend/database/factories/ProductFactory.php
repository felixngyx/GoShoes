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
        return [
            'sku' => Str::upper(Str::random(10)),
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'price' => $this->faker->randomFloat(2, 50, 500),
            'stock_quantity' => rand(10, 100),
            'promotional_price' => $this->faker->randomFloat(2, 30, 150),
            'status' => 'public',
            'is_deleted' => false,
            'rating_count' => rand(1, 5),
            'slug' => Str::slug($this->faker->word),
            'thumbnail' => $this->faker->imageUrl(),
            'hagtag' => '#sample #product',
        ];
    }

    public function upsertProducts(int $count)
    {
        $products = [];
        for ($i = 0; $i < $count; $i++) {
            $products[] = $this->definition();
        }

        Product::upsert($products, ['sku'], ['name', 'description', 'price', 'stock_quantity', 'promotional_price', 'status', 'is_deleted', 'rating_count', 'slug', 'thumbnail', 'hagtag']);
    }
}
