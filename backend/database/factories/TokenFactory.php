<?php

namespace Database\Factories;

use App\Models\Token;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TokenFactory extends Factory
{
    protected $model = Token::class;

    public function definition()
    {
        return [
            'token' => Str::random(60),
            'user_id' => rand(1, 10),
            'is_used' => false,
        ];
    }
} 