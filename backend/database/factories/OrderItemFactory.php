<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition()
    {
        return [
            'order_id' => rand(1, 10),
            'product_id' => rand(1, 10),
            'price' => $this->faker->randomFloat(2, 10, 100),
            'quantity' => rand(1, 5),
            'variant_id' => rand(1, 5),
        ];
    }
} 