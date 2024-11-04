<?php

namespace App\Services\ServiceInterfaces\Cart;

Interface CartServiceInterface
{
    public function all();

    public function createOrUpdate(array $request);

    public function delete(array $request);

    public function getAllByUserId();


}
