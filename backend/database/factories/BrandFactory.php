<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    protected $model = Brand::class;

    public function definition()
    {
        return [
            'name' => $this->faker->company,
            'logo_url' => $this->faker->imageUrl(),
            'slug' => $this->faker->slug,
        ];
    }

    public function upsertBrands(int $count)
    {
        $brands = [];
        for ($i = 0; $i < $count; $i++) {
            $brands[] = $this->definition();
        }

        Brand::upsert($brands, ['name'], ['logo_url'], ['slug']);
    }
}
