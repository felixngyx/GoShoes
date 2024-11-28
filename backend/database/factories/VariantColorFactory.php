<?php

namespace Database\Factories;

use App\Models\VariantColor;
use Illuminate\Database\Eloquent\Factories\Factory;

class VariantColorFactory extends Factory
{
    protected $model = VariantColor::class;

    public function definition()
    {
        $imageUrls = file('database/factories/test.txt', FILE_IGNORE_NEW_LINES);
        $randomImageUrl = trim($imageUrls[array_rand($imageUrls)]);

        return [
            'color' => $this->faker->colorName,
            'link_image' => $randomImageUrl,
        ];
    }

    public function upsertVariantColors(int $count)
    {
        $colors = [];
        for ($i = 0; $i < $count; $i++) {
            $colors[] = $this->definition();
        }

        VariantColor::upsert($colors, ['name'], ['link_image']);
    }
}
