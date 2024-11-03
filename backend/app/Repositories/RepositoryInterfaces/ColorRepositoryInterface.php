<?php

namespace App\Repositories\RepositoryInterfaces;

use App\Models\VariantColor;

interface ColorRepositoryInterface
{
    public function createColor(array $data);
    public function findColorById(int $id);
    public function updateColor(int $id, array $data);  // Thêm hàm update
    public function deleteColor(VariantColor $color);
    public function deleteColorsByIds(array $ids);


}
