<?php

namespace Database\Factories;

use App\Models\VariantSize;
use Illuminate\Database\Eloquent\Factories\Factory;

class VariantSizeFactory extends Factory
{
    protected $model = VariantSize::class;

    public function definition()
    {
        return [
            'size' => $this->faker->word,
        ];
    }

    public function upsertVariantSizes(int $count)
    {
        $sizes = [];
        for ($i = 0; $i < $count; $i++) {
            $sizes[] = $this->definition();
        }

        VariantSize::upsert($sizes, ['size']);
    }
}
