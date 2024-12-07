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
    public function findColorById(int $id){
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
        if ($color->variants()->count() > 0) {
            throw new \Exception('This color cannot be deleted because it is being used in product variants.');
        }

        return $color->delete();
    }
    public function deleteColorsByIds(array $ids)
    {
        $colorsWithVariants = VariantColor::whereIn('id', $ids)
            ->withCount('variants')
            ->having('variants_count', '>', 0)
            ->get();

        if ($colorsWithVariants->isNotEmpty()) {
            throw new \Exception('Cannot delete selected colors because some colors are being used in product variants.');
        }

        return VariantColor::whereIn('id', $ids)->delete();
    }

}
