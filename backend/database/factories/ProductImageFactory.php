<?php

namespace Database\Factories;

use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductImageFactory extends Factory
{
    protected $model = ProductImage::class;

    public function definition()
    {
        $imageUrls = file('database/factories/test.txt', FILE_IGNORE_NEW_LINES);
        $randomImageUrl = trim($imageUrls[array_rand($imageUrls)]);


        return [
            'product_id' => rand(1, 10),
            'image_path' => $randomImageUrl,
        ];
    }
}
