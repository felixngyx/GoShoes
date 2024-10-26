<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run()
    {
        // Tạo 5 danh mục chính
        for ($i = 1; $i <= 5; $i++) {
            $category = Category::create([
                'name' => 'Category ' . $i,
                'slug' => Str::slug('Category ' . $i, '-'),
                'description' => 'Description for Category ' . $i,
                'parent_id' => null, // Danh mục chính không có parent
            ]);

            // Tạo 2 danh mục con cho mỗi danh mục chính
            for ($j = 1; $j <= 2; $j++) {
                Category::create([
                    'name' => 'Subcategory ' . $i . '-' . $j,
                    'slug' => Str::slug('Subcategory ' . $i . '-' . $j, '-'),
                    'description' => 'Description for Subcategory ' . $i . '-' . $j,
                    'parent_id' => $category->id, // Thiết lập parent_id là id của danh mục chính
                ]);
            }
        }
    }
}
