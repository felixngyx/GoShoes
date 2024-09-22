<?php

namespace App\Services\ServiceInterfaces;

Interface UserServiceInterface
{
    public function all();

    public function create(array $request);

    public function update(array $data, $id);

    public function delete($id);

    public function findById($id);

}
