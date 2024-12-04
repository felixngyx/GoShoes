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
                'title' => 'Where Comfort Meets Courage: Your Journey Starts Here',
                'position' => 'home1',
                'image' => 'banner1.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Every Step Tells A Story: Walk Your Own Path With Confidence',
                'position' => 'home2',
                'image' => 'banner2.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Beyond Shoes, Beyond Limits: Redefine Your Movement',
                'position' => 'home3',
                'image' => 'banner3.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Crafted for Dreamers, Designed for Achievers',
                'position' => 'home4',
                'image' => 'banner4.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'More Than Footwear, A Statement of Who You Are',
                'position' => 'home5',
                'image' => 'banner5.jpg',
                'url' => 'https://www.google.com',
                'active' => 1,
            ],
            [
                'title' => 'Transform Your Journey: Unbeatable Deals That Move You Forward',
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
