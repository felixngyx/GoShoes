<?php

namespace Database\Factories;

use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition()
    {
        return [
            'product_id' => rand(1, 10),
            'user_id' => rand(1, 5),
            'rating' => $this->faker->randomFloat(1, 1, 5),
            'comment' => $this->faker->sentence,
        ];
    }
} 