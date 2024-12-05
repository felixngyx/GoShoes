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
        $tenGiay = $this->faker->randomElement(['Nike', 'Adidas', 'Converse', 'Vans'])
            . ' '
            . $this->faker->unique()->word()
            . ' '
            . Str::random(5);
        $price = $this->faker->randomFloat(2, 50, 500) * $this->faker->randomFloat(1, 0.8, 1.2) *1000;

        $product = [
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

        $createdProduct = Product::create($product);

        $colors = range(1, 10); // Giả sử có 10 màu
        $sizes = range(1, 5);   // Giả sử có 5 size

        foreach ($colors as $color_id) {
            foreach ($sizes as $size_id) {
                $variantData = [
                    'sku' => $product['sku'] . '-' . $color_id . '-' . $size_id,
                    'size_id' => $size_id,
                    'color_id' => $color_id,
                    'quantity' => rand(5, 50),
                ];

                $createdProduct->variants()->create($variantData);
            }
        }

        return $product;
    }

    public function upsertProducts(int $count)
    {
        for ($i = 0; $i < $count; $i++) {
            $this->definition();
        }
    }
}
