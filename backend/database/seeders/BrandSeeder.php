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
        $brands = ['Nike', 'Adidas', 'Gucci', 'New Balance', 'Promax', 'Mira'];

        foreach ($brands as $brand) {
            Brand::create([
                'name' => $brand,
            ]);
        }
    }
}
