<?php

namespace App\Services\ServiceInterfaces\WishList;

Interface WishListServiceInterface
{
    public function all();

    public function create(array $request);

    public function update(array $data, int $id);

    public function delete(int $id);

    public function findById(int $id);

    public function findByEmail(string $email);

}
