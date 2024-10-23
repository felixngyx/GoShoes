<?php

namespace App\Repositories\RepositoryInterfaces;

use App\Models\VariantSize;

interface SizeRepositoryInterface
{
    public function createSize(array $data);
    public function findSizeById(int $id);
    public function updateSize(int $id, array $data);  // Thêm hàm update
    public function deleteSize(VariantSize $Size);
}
