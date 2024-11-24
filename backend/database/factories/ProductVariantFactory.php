<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition()
    {
        return [
            'product_id' => rand(1, 10),
            'color_id' => rand(1, 5),
            'size_id' => rand(1, 5),
            'quantity' => rand(10, 100),
            'sku' => $this->faker->unique()->randomNumber(8),
        ];
    }

    public function upsertProductVariants(int $count)
    {
        $variants = [];
        for ($i = 0; $i < $count; $i++) {
            $variants[] = $this->definition();
        }

        ProductVariant::upsert($variants, ['product_id', 'color_id', 'size_id'], ['quantity']);
    }
}
