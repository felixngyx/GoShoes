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
           
            $this->brandRepository->deleteBrand($brand);

            return response()->json([
                'message' => 'Thương hiệu đã được xóa thành công!',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting brand: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa thương hiệu.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function deleteBrands(array $ids)
    {
        if (empty($ids)) {
            return response()->json(['message' => 'Không có ID nào được cung cấp!'], 400);
        }
        try {
            $deletedCount = $this->brandRepository->deleteBrandsByIds($ids);
            return response()->json(['message' => 'Đã xóa thành công ' . $deletedCount . ' thương hiệu!'], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting brands: ' . $e->getMessage());
            return response()->json(['message' => 'Có lỗi xảy ra khi xóa thương hiệu.', 'error' => $e->getMessage()], 500);
        }
    }
}
