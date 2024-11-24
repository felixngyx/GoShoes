<?php

namespace Database\Factories;

use App\Models\ImageVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImageVariantFactory extends Factory
{
    protected $model = ImageVariant::class;

    public function definition()
    {
        return [
            'product_id' => rand(1, 10),
            'color_id' => rand(1, 5),
            'image' => 'image1, image2, image3',
        ];
    }

    public function upsertImageVariants(int $count)
    {
        $imageVariants = [];
        for ($i = 0; $i < $count; $i++) {
            $imageVariants[] = $this->definition();
        }

        ImageVariant::upsert($imageVariants, ['product_id', 'color_id', 'image'], []);
    }
}
