<?php

namespace App\Repositories\RepositoryInterfaces;

Interface BaseRepositoryInterface
{

    public function all();

    public function create(array $data);

    public function update(array $data, $id);

    public function delete($id);

    public function findById($id);

}
