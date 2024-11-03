<?php

namespace App\Repositories;

use App\Models\VariantColor;

use App\Repositories\RepositoryInterfaces\ColorRepositoryInterface;
use Illuminate\Support\Facades\Storage;

class ColorRepository implements ColorRepositoryInterface
{
    public function createColor(array $data)
    {
        return VariantColor::create($data);
    }
    public function findColorById(int $id)
    {
        return VariantColor::find($id);
    }
    public function updateColor(int $id, array $data) // Hàm updateColor
    {
        $color = $this->findColorById($id);
        if ($color) {
            $color->update($data);
            return $color;
        }

        return null;
    }
    public function deleteColor(VariantColor $color)

    {
        return $color->delete();
    }
    public function deleteColorsByIds(array $ids)
    {
        return VariantColor::whereIn('id', $ids)->delete();  // Xóa tất cả màu sắc theo ID
    }
}
