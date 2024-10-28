<?php

namespace App\Repositories\RepositoryInterfaces;

Interface BaseRepositoryInterface
{

    public function all();

    public function create(array $data);

    public function update(array $data, int $id);

    public function delete(int $id);

    public function findById(int $id);

    public function upsert(array $data, array $condition);

    public function forceDelete(int $id);

    public static function getDataFromCache(array $columns, array $condition);

}
