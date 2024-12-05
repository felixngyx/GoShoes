<?php

namespace Database\Seeders;

use App\Models\Shipping;
use Illuminate\Database\Seeder;

class ShippingSeeder extends Seeder
{
    public function run()
    {
        $shippings = [
            [
                'user_id' => 1,
                'shipping_detail' => [
                    'name' => 'John Doe',
                    'address' => '123 Main St',
                    'city' => 'New York',
                    'postal_code' => '10001',
                    'country' => 'USA',
                    'phone_number' => '1234567890',
                ],
                'is_default' => true,
            ],
            [
                'user_id' => 2,
                'shipping_detail' => [
                    'name' => 'Jane Smith',
                    'address' => '456 Elm St',
                    'city' => 'Los Angeles',
                    'postal_code' => '90001',
                    'country' => 'USA',
                    'phone_number' => '0987654321',
                ],
                'is_default' => true,
            ],
            [
                'user_id' => 3,
                'shipping_detail' => [
                    'name' => 'Mike Johnson',
                    'address' => '789 Oak St',
                    'city' => 'Chicago',
                    'postal_code' => '60601',
                    'country' => 'USA',
                    'phone_number' => '1122334455',
                ],
                'is_default' => true,
            ],
        ];

        foreach ($shippings as $shipping) {
            Shipping::create($shipping);
        }
    }
}
