<?php

namespace App\Services\Brand;

use Illuminate\Support\Facades\Log;
use App\Repositories\RepositoryInterfaces\BrandRepositoryInterface;

use App\Models\Brand;
use Illuminate\Support\Facades\Storage;

class BrandService
{
    protected $brandRepository;

    public function __construct(BrandRepositoryInterface $brandRepository)
    {
        $this->brandRepository = $brandRepository;
    }

    public function storeBrand($validated)
    {
        try {

            $BrandData = [
                'name' => $validated['name'],
                'logo_url' => $validated['logo_url'],

            ];
            $brand = $this->brandRepository->createBrand($BrandData);

            return $brand;
        } catch (\Exception $e) {
            Log::error('Error updating brand: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật thương hiệu',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function findBrandId(string $id)
    {
        return $this->brandRepository->findBrandById($id);
    }

    public function updateBrand($id, $validated)
    {
        try {

            $brand = $this->brandRepository->findBrandById($id);

            $brandData = [
                'name' => $validated['name'],
                'logo_url' => $validated['logo_url'],
            ];
            $updatedBrand = $this->brandRepository->updateBrand($id, $brandData);

            return response()->json([
                'message' => 'Cập nhật thương hiệu thành công!',
                'brand' => $updatedBrand
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating brand: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật thương hiệu',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteBrand(Brand $brand)
    {
        try {
            // Kiểm tra xem có sản phẩm nào thuộc thương hiệu này không
            if ($brand->products()->count() > 0) {
                return response()->json([
                    'message' => 'You cannot delete this brand because it has products.',
                ], 400);
            }

            $result = $this->brandRepository->deleteBrand($brand);

            if ($result) {
                return response()->json([
                    'message' => 'Thương hiệu đã được xóa thành công!'
                ], 200, [], JSON_UNESCAPED_UNICODE);
            }

            return response()->json([
                'message' => 'Không thể xóa thương hiệu.'
            ], 400, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('Error deleting brand: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa thương hiệu.',
                'error' => $e->getMessage()
            ], 500, [], JSON_UNESCAPED_UNICODE);
        }
    }
    public function deleteBrands(array $ids)
    {
        if (empty($ids)) {
            return response()->json(['message' => 'No IDs provided!'], 400);
        }
        try {
            // Kiểm tra các thương hiệu được chọn
            $brandsWithProducts = Brand::whereIn('id', $ids)
                ->withCount('products')
                ->having('products_count', '>', 0)
                ->get();

            if ($brandsWithProducts->isNotEmpty()) {
                return response()->json([
                    'message' => 'You cannot delete the selected brands because some brands have products.'
                ], 400);
            }

            $deletedCount = $this->brandRepository->deleteBrandsByIds($ids);
            return response()->json([
                'message' => 'Successfully deleted ' . $deletedCount . ' brands!'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error deleting brands: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while deleting the brands.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
