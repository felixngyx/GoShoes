<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use App\Models\PostCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    public function run()
    {
        // Retrieve some sample users and categories for seeding
        $user = User::first();  // Assuming there's at least one user in the users table
        $category = PostCategory::first();  // Assuming there's at least one category in the categories table

        // Create sample posts
        Post::create([
            'title' => 'Sample Post 1',
            'content' => 'This is the content of the first sample post.',
            'image' => 'sample1.jpg',  // Replace with a valid image file path
            'category_id' => $category->id,
            'author_id' => $user->id,
            'slug' => Str::slug('Sample Post 1'),
            'scheduled_at' => now(),
            'published_at' => now(),
        ]);

        Post::create([
            'title' => 'Sample Post 2',
            'content' => 'This is the content of the second sample post.',
            'image' => 'sample2.jpg',
            'category_id' => $category->id,
            'author_id' => $user->id,
            'slug' => Str::slug('Sample Post 2'),
            'scheduled_at' => now(),
            'published_at' => now(),
        ]);
        Post::create([
            'title' => 'Sample Post 3',
            'content' => 'This is the content of the second sample post.',
            'image' => 'sample3.jpg',
            'category_id' => $category->id,
            'author_id' => $user->id,
            'slug' => Str::slug('Sample Post 3'),
            'scheduled_at' => now(),
            'published_at' => now(),
        ]);
        Post::create([
            'title' => 'Sample Post 4',
            'content' => 'This is the content of the second sample post.',
            'image' => 'sample4.jpg',
            'category_id' => $category->id,
            'author_id' => $user->id,
            'slug' => Str::slug('Sample Post 4'),
            'scheduled_at' => now(),
            'published_at' => now(),
        ]);
        Post::create([
            'title' => 'Sample Post 5',
            'content' => 'This is the content of the second sample post.',
            'image' => 'sample5.jpg',
            'category_id' => $category->id,
            'author_id' => $user->id,
            'slug' => Str::slug('Sample Post 5'),
            'scheduled_at' => now(),
            'published_at' => now(),
        ]);
        Post::create([
            'title' => 'Sample Post 6',
            'content' => 'This is the content of the second sample post.',
            'image' => 'sample6.jpg',
            'category_id' => $category->id,
            'author_id' => $user->id,
            'slug' => Str::slug('Sample Post 6'),
            'scheduled_at' => now(),
            'published_at' => now(),
        ]);
        Post::create([
            'title' => 'Sample Post 7',
            'content' => 'This is the content of the second sample post.',
            'image' => 'sample7.jpg',
            'category_id' => $category->id,
            'author_id' => $user->id,
            'slug' => Str::slug('Sample Post 7'),
            'scheduled_at' => now(),
            'published_at' => now(),
        ]);
        Post::create([
            'title' => 'Sample Post 8',
            'content' => 'This is the content of the second sample post.',
            'image' => 'sample8.jpg',
            'category_id' => $category->id,
            'author_id' => $user->id,
            'slug' => Str::slug('Sample Post 8'),
            'scheduled_at' => now(),
            'published_at' => now(),
        ]);
    }
}
