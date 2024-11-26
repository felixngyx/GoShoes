<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VariantColor;
use App\Models\VariantSize;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    protected $ids;
    protected $colors;

    protected $sizes;

    public function __construct()
    {
        parent::__construct();
        $this->ids = Product::pluck('id')->toArray();
        $this->colors = VariantColor::pluck('id')->toArray();
        $this->sizes = VariantSize::pluck('id')->toArray();
    }
    public function definition()
    {
        return [
            'product_id' => $this->ids[array_rand($this->ids)],
            'color_id' => $this->colors[array_rand($this->colors)],
            'size_id' => $this->sizes[array_rand($this->sizes)],
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
