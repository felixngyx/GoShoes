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
        $categories = [
            'Sports Shoes',
            'Running Shoes',
            'Football Shoes',
            'Basketball Shoes',
            'Casual Shoes',
            'High-top Shoes',
            'Sneakers',
            "Men's Dress Shoes",
            "Women's Dress Shoes",
            'Loafers',
            'Sandals',
            'Trekking Shoes',
            'Adventure Shoes',
            'Office Shoes',
            'Tennis Shoes'
        ];

        $parentCategories = [
            "Men's Shoes",
            "Women's Shoes",
            "Kids' Shoes",
            'Sports Shoes',
            'Luxury Shoes'
        ];

        // Probability of being a parent category
        if ($this->faker->boolean(20)) {
            $name = $this->faker->unique()->randomElement($parentCategories);
            return [
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => $this->faker->sentence,
                'parent_id' => null,
            ];
        }

        $name = $this->faker->unique()->randomElement($categories);
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence,
            'parent_id' => Category::whereNotNull('parent_id')->exists()
                ? Category::whereNotNull('parent_id')->inRandomOrder()->first()->id
                : null,
        ];
    }

    public function upsertCategories(int $count)
    {
        $categories = [];
        $existingSlugs = Category::pluck('slug')->toArray();

        for ($i = 0; $i < $count; $i++) {
            do {
                $category = $this->definition();
            } while (in_array($category['slug'], $existingSlugs));

            $existingSlugs[] = $category['slug'];
            $categories[] = $category;
        }

        Category::upsert($categories, ['slug'], ['name', 'description', 'parent_id']);
    }
}
