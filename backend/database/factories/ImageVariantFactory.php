<?php

namespace Database\Factories;

use App\Models\ImageVariant;
use App\Models\Product;
use App\Models\VariantColor;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImageVariantFactory extends Factory
{
    protected $model = ImageVariant::class;

    protected $ids;
    protected $colors;

    public function __construct()
    {
        parent::__construct();
        $this->ids = Product::pluck('id')->toArray();
        $this->colors = VariantColor::pluck('id')->toArray();
    }
    public function definition()
    {
        $imageUrls = file('database/factories/test.txt', FILE_IGNORE_NEW_LINES);
        $randomImages = [];

        // Lấy 3 ảnh ngẫu nhiên
        for ($i = 0; $i < 3; $i++) {
            $randomImages[] = trim($imageUrls[array_rand($imageUrls)]);
        }

        return [
            'product_id' => $this->ids[array_rand($this->ids)],
            'color_id' => $this->colors[array_rand($this->colors)],
            'image' => implode(', ', $randomImages),
        ];
    }

    public function upsertImageVariants(int $count)
    {
        $imageVariants = [];
        for ($i = 0; $i < $count; $i++) {
            $imageVariants[] = $this->definition();
        }

        ImageVariant::upsert($imageVariants, ['product_id', 'color_id']);
    }
}
