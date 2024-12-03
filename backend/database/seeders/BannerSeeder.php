<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Banner 1',
                'position' => 'home1',
                'image' => 'banner1.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Banner 2',
                'position' => 'home2',
                'image' => 'banner2.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Banner 3',
                'position' => 'home3',
                'image' => 'banner3.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Banner 4',
                'position' => 'home4',
                'image' => 'banner4.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Banner 5',
                'position' => 'home5',
                'image' => 'banner5.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Banner 6',
                'position' => 'all1',
                'image' => 'banner6.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
        ];

        foreach ($banners as $banner) {
            \App\Models\Banner::create($banner);
        }
    }
}
