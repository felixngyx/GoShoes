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
            $logo_url = null;
            if (isset($validated['logo_url'])) {
                $logo_url = $validated['logo_url'];
                $logo_urlName = time() . '_' . $logo_url->getClientOriginalName();
                $logo_urlPath = $logo_url->storeAs('LogoBrand', $logo_urlName, 'public');
            }
            $BrandData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'logo_url' => $logo_urlPath,
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
            // Kiểm tra ID có hợp lệ không
            if (!is_numeric($id) || $id <= 0) {
                return response()->json([
                    'message' => 'ID thương hiệu không hợp lệ',
                    'error' => 'Invalid ID format'
                ], 400);
            }

            // Tìm brand cần update
            $brand = $this->brandRepository->findBrandById($id);
       
            // Chuẩn bị dữ liệu cập nhật
            $brandData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
            ];

            // Xử lý logo nếu có upload mới
            if (isset($validated['logo_url']) && $validated['logo_url']) {
                // Xóa logo cũ nếu tồn tại
                if ($brand->logo_url && Storage::disk('public')->exists($brand->logo_url)) {
                    Storage::disk('public')->delete($brand->logo_url);
                }

                // Upload và lưu logo mới
                $logo_url = $validated['logo_url'];
                $logo_urlName = time() . '_' . $logo_url->getClientOriginalName();
                $logo_urlPath = $logo_url->storeAs('LogoBrand', $logo_urlName, 'public');

                // Thêm logo mới vào dữ liệu cập nhật
                $brandData['logo_url'] = $logo_urlPath;
            }

            // Thực hiện cập nhật brand
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
            // Xóa file ảnh trước
            if ($brand->logo_url) {
                if (Storage::disk('public')->exists($brand->logo_url)) {
                    Storage::disk('public')->delete($brand->logo_url);
                }
            }

            // Sau đó xóa brand
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
}
