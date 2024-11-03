<?php

namespace App\Services\Sizes;
use Illuminate\Support\Facades\Log;
use App\Repositories\RepositoryInterfaces\SizeRepositoryInterface;

use App\Models\VariantSize;

class SizeService
{
    protected $sizeRepository;

    public function __construct(SizeRepositoryInterface $sizeRepository)
    {
        $this->sizeRepository = $sizeRepository;
    }


    public function storeSize($validated)
    {
        try {
            $SizeData = [
                'size' => $validated['size'],
                'code' => $validated['code'],
            ];
            $size = $this->sizeRepository->createSize($SizeData);
            return $size;
        } catch (\Exception $e) {

            Log::error('Error    size: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi lưu size.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function findSize(string $id){
        return $this->sizeRepository->findSizeById($id);
    }
    public function updateSize($id, $validated)  // Hàm updateColor
    {
        try {
            $sizerData = [
                'size' => $validated['size'],
                'code' => $validated['code'],
            ];
            $size = $this->sizeRepository->updateSize($id, $sizerData);
            if ($size) {
                return $size;
            }

            return response()->json(['message' => 'Không tìm thấy size'], 404);
        } catch (\Exception $e) {
            Log::error('Error updating size: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật size',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteSize(VariantSize $size)
    {
        try {
            $this->sizeRepository->deleteSize($size);

            return response()->json([
                'message' => 'Size đã được xóa thành công!',
            ], 200);
        } catch (\Exception $e) {
            // Ghi log lỗi và trả về thông báo lỗi
            Log::error('Error deleting size: ' . $e->getMessage());

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa Size.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
