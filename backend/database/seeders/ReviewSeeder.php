<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        foreach (range(1, 20) as $index) {
            DB::table('reviews')->insert([
                'product_id' => rand(1, 10), // Giả sử có 10 sản phẩm trong bảng products
                'user_id' => rand(1, 5),
                'rating' => $faker->randomFloat(1, 1, 5), // Tạo số thập phân từ 1.0 đến 5.0
                'comment' => $faker->sentence,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
