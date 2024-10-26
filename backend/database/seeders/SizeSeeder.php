<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VariantSize;

class SizeSeeder extends Seeder
{
    public function run()
    {
        $sizes = ['S', 'M', 'L', 'XL', 'XXL'];

        foreach ($sizes as $size) {
            VariantSize::create([
                'size' => $size,
                'code' => $size,
            ]);
        }
    }
}
