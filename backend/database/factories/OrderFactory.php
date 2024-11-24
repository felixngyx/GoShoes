<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition()
    {
        return [
            'user_id' => rand(1, 5),
            'total' => $this->faker->randomFloat(2, 50, 500),
            'status' => $this->faker->randomElement(['pending', 'processing', 'completed', 'cancelled']),
            'sku' => strtoupper($this->faker->bothify('ORD###??')),
            'shipping_id' => rand(1, 3),
        ];
    }
} 