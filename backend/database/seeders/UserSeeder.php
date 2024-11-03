<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::insert([
            ['name' => 'User 1', 'email' => 'user1@example.com', 'password' => bcrypt('password')],
            ['name' => 'User 2', 'email' => 'user2@example.com', 'password' => bcrypt('password')],
            ['name' => 'User 3', 'email' => 'user3@example.com', 'password' => bcrypt('password')],
        ]);
    }
}