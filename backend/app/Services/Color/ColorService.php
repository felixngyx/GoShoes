<?php

namespace App\Services\Color;
use Illuminate\Support\Facades\Log;
use App\Repositories\RepositoryInterfaces\ColorRepositoryInterface;

use App\Models\VariantColor;

class ColorService
{
    protected $colorRepository;

    public function __construct(ColorRepositoryInterface $colorRepository)
    {
        $this->colorRepository = $colorRepository;
    }


    public function storeColor($validated)
    {
        try {
            $colorData = [
                'color' => $validated['color'],
                'link_image' => $validated['link_image'],
            ];
            $color = $this->colorRepository->createColor($colorData);
            return $color;
        } catch (\Exception $e) {

            Log::error('Error    color: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi lưu sản phẩm.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function findColor(string $id){
        return $this->colorRepository->findColorById($id);
    }
    public function updateColor($id, $validated)  // Hàm updateColor
    {
        try {
            $colorData = [
                'color' => $validated['color'],
                'link_image' => $validated['link_image'],
            ];

            $color = $this->colorRepository->updateColor($id, $colorData);
            if ($color) {
                return $color;
            }

            return response()->json(['message' => 'Không tìm thấy màu sắc.'], 404);
        } catch (\Exception $e) {
            Log::error('Error updating color: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật màu sắc.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteColor(VariantColor $color)
    {
        try {
            $this->colorRepository->deleteColor($color);

            return response()->json([
                'message' => 'Màu sắc đã được xóa thành công!'
            ], 200, [], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            Log::error('Error deleting color: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'being used')) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 400);
            }

            return response()->json([
                'message' => 'An error occurred while deleting the color.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteColors(array $ids)
    {
        if (empty($ids)) {
            return response()->json(['message' => 'Không có IDnào được cung cấp!'], 400, [], JSON_UNESCAPED_UNICODE);
        }
        try {
            $deletedCount = $this->colorRepository->deleteColorsByIds($ids);
            return response()->json([
                'message' => 'Đã xóa thành công' . $deletedCount . ' màu sắc!'
            ], 200, [], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            Log::error('Error deleting colors: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'being used')) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 400);
            }

            return response()->json([
                'message' => 'An error occurred while deleting the color.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
