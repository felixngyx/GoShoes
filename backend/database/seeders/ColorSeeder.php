<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VariantColor;

class ColorSeeder extends Seeder
{
    public function run()
    {
        $colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White'];

        foreach ($colors as $color) {
            VariantColor::create([
                'color' => $color,
                'link_image' => 'https://placehold.co/600x400',
            ]);
        }
    }
}
