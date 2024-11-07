<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PostCategory;
use Illuminate\Support\Str;

class PostCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Xu hướng thời trang', 'slug' => Str::slug('Xu hướng thời trang')],
            ['name' => 'Phong cách đường phố', 'slug' => Str::slug('Phong cách đường phố')],
            ['name' => 'Thời trang công sở', 'slug' => Str::slug('Thời trang công sở')],
            ['name' => 'Phụ kiện thời trang', 'slug' => Str::slug('Phụ kiện thời trang')],
            ['name' => 'Thời trang mùa hè', 'slug' => Str::slug('Thời trang mùa hè')],
        ];
        foreach ($categories as $category) {
            PostCategory::create($category);
        }
    }
}
