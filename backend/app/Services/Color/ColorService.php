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
                'hex_code' => $validated['hex_code'],
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
                'hex_code' => $validated['hex_code'],
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
                'message' => 'Màu sắc đã được xóa thành công!',
            ], 200);
        } catch (\Exception $e) {
            // Ghi log lỗi và trả về thông báo lỗi
            Log::error('Error deleting product: ' . $e->getMessage());

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa màu sắc.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
