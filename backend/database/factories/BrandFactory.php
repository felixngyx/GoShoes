<?php
namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    protected $model = Brand::class;

    public function definition()
    {
        $brands = [
            'Nike', 'Adidas', 'Converse', 'Vans', 'New Balance',
            'Puma', 'Reebok', 'Jordan', 'Skechers', 'Asics',
            'Under Armour', 'Fila', 'Lacoste', 'Timberland', 'Clarks',
            'Mizuno', 'Onitsuka Tiger', 'Dolce & Gabbana', 'Gucci', 'Balenciaga'
        ];

        $selectedBrand = $this->faker->randomElement($brands);

        return [
            'name' => $selectedBrand,
            'logo_url' => $this->faker->imageUrl(200, 200, $selectedBrand, true),
            'slug' => $this->faker->unique()->slug,
        ];
    }

    public function upsertBrands(int $count)
    {
        $brands = [];
        $existingBrands = Brand::pluck('name')->toArray();

        for ($i = 0; $i < $count; $i++) {
            do {
                $brand = $this->definition();
            } while (in_array($brand['name'], $existingBrands));

            $existingBrands[] = $brand['name'];
            $brands[] = $brand;
        }

        Brand::upsert($brands, ['name'], ['logo_url', 'slug']);
    }
}
