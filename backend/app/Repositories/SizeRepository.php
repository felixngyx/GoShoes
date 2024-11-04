<?php

namespace App\Repositories;

use App\Models\VariantSize;

use App\Repositories\RepositoryInterfaces\SizeRepositoryInterface;
use Illuminate\Support\Facades\Storage;

class SizeRepository implements SizeRepositoryInterface
{
    public function createSize(array $data)
    {
        return VariantSize::create($data);
    }
    public function findSizeById(int $id){
        return VariantSize::find($id);
    }
    public function updateSize(int $id, array $data) // Hàm updateSize
    {
        $Size = $this->findSizeById($id);
        if ($Size) {
            $Size->update($data);
            return $Size;
        }

        return null;
    }
    public function deleteSize(VariantSize $Size)

    {
        return $Size->delete();
    }
    public function deleteSizesByIds(array $ids){
        return VariantSize::whereIn('id', $ids)->delete();  // Xóa tất cả kích thước theo ID
    }
}
