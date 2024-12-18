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
            $result = $this->sizeRepository->deleteSize($size);

            if ($result) {
                return response()->json([
                    'message' => 'Size is deleted successfully!'
                ], 200);
            }

            return response()->json([
                'message' => 'Bạn không thể xóa size này vì nó đang được sử dụng trong biến thể.'
            ], 400);

        } catch (\Exception $e) {
            Log::error('Error deleting size: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'being used')) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 400);
            }

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa size.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteSizes(array $ids)
    {
        if (empty($ids)) {
            return response()->json(['message' => 'No IDs provided!'], 400);
        }
        try {
            $deletedCount = $this->sizeRepository->deleteSizesByIds($ids);
            return response()->json(['message' => 'Successfully deleted ' . $deletedCount . ' sizes!'], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting sizes: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'being used')) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 400);
            }

            return response()->json([
                'message' => 'An error occurred while deleting the sizes.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
