<?php

namespace Database\Seeders;

use App\Models\Shipping;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class ShippingSeeder extends Seeder
{
    public function run()
    {
        // Tạo dữ liệu mẫu
        $shippings = [
            [
                'user_id' => 1,
                'address' => '123 Main St',
                'city' => 'New York',
                'postal_code' => '10001',
                'country' => 'USA',
                'phone_number' => '1234567890',
            ],
            [
                'user_id' => 2,
                'address' => '456 Elm St',
                'city' => 'Los Angeles',
                'postal_code' => '90001',
                'country' => 'USA',
                'phone_number' => '0987654321',
            ],
            [
                'user_id' => 3,
                'address' => '789 Oak St',
                'city' => 'Chicago',
                'postal_code' => '60601',
                'country' => 'USA',
                'phone_number' => '1122334455',
            ],
        ];

        // Thêm dữ liệu vào bảng shipping
        Shipping::insert($shippings);
    }
}
