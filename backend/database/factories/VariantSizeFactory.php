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
            'size' =>  $this->faker->numberBetween(30, 60),
        ];
    }

    public function upsertVariantSizes(int $count)
    {
        $sizes = collect(range(30, 60))
            ->shuffle()
            ->take($count)
            ->map(function ($size) {
                return ['size' => $size];
            })
            ->toArray();

        VariantSize::upsert($sizes, ['size']);
    }
}
