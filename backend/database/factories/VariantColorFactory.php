<?php

namespace Database\Factories;

use App\Models\VariantColor;
use Illuminate\Database\Eloquent\Factories\Factory;

class VariantColorFactory extends Factory
{
    protected $model = VariantColor::class;

    public function definition()
    {
        return [
            'color' => $this->faker->colorName,
            'link_image' => $this->faker->imageUrl(),
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
