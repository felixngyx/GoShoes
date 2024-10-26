<?php

namespace App\Services\ServiceInterfaces\Cart;

Interface CartServiceInterface
{
    public function allService();

    public function createService(array $request);

    public function updateService(array $data, int $userId, int $productId);

    public function deleteService(int $id);


}
