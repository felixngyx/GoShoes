<?php

namespace Database\Seeders;
use Illuminate\Support\Str;
use App\Models\Brand;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $colors = ['Nike', 'Adidas', 'Gucci', 'New Balance', 'Promax', 'Mira'];

        foreach ($colors as $color) {
            Brand::create([
                'name' => $color,
                'description' => 'This is a sample description for product',
                'logo_url' => 'brands/sample-brand-'. Str::slug($color). '.jpg', // Hình ảnh logo của thương hiệu
                'is_active' => true,
            ]);
        }
    }
}
