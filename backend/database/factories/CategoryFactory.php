<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
            'slug' => Str::slug($this->faker->word),
            'description' => $this->faker->sentence,
            'parent_id' => null,
        ];
    }

    public function upsertCategories(int $count)
    {
        $categories = [];
        for ($i = 0; $i < $count; $i++) {
            $categories[] = $this->definition();
        }

        Category::upsert($categories, ['slug'], ['name', 'description', 'parent_id']);
    }
} 