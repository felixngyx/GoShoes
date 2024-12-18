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
    public function deleteSize(VariantSize $size)
    {
        // Kiểm tra xem có biến thể nào đang sử dụng size này không
        if ($size->variants()->count() > 0) {
            throw new \Exception('Bạn không thể xóa size này vì nó đang được sử dụng trong biến thể.');
        }

        return $size->delete();
    }
    public function deleteSizesByIds(array $ids)
    {
        // Kiểm tra tất cả size được chọn
        $sizesWithVariants = VariantSize::whereIn('id', $ids)
            ->withCount('variants')
            ->having('variants_count', '>', 0)
            ->get();

        if ($sizesWithVariants->isNotEmpty()) {
            throw new \Exception('You cannot delete the selected sizes because some sizes are being used in product variants.');
        }

        return VariantSize::whereIn('id', $ids)->delete();
    }
}
