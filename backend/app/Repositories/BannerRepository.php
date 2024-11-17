<?php

namespace App\Repositories;

use App\Models\Banner;
use App\Models\BannerImage;
use App\Repositories\RepositoryInterfaces\BannerRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class BannerRepository implements BannerRepositoryInterface
{
    public function getAll()
    {
        return Banner::with('images')->get();
    }

    public function getById($id)
    {
        return Banner::with('images')->find($id);
    }

    public function create(array $data)
    {
        DB::beginTransaction();
        try {
            // Tạo bản ghi banner
            $banner = Banner::create([
                'title' => $data['title'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'active' => $data['active']
            ]);

            // Kiểm tra và thêm ảnh nếu có
            if (!empty($data['images'])) {
                foreach ($data['images'] as $imageData) {
                    $this->createBannerImage([
                        'banner_id' => $banner->id,
                        'image_path' => $imageData['image_path'],
                        'title' => $imageData['title'] ?? null,
                        
                    ]);
                }
            }


            DB::commit();
            return $banner->load('images'); // Trả về banner kèm danh sách ảnh
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Error creating banner: " . $e->getMessage());
        }
    }
    public function createBannerImage(array $data)
    {
        return BannerImage::create($data);
    }

    public function update($id, array $data)
    {
        DB::beginTransaction();
        try {
            // Tìm banner theo ID
            $banner = Banner::find($id);

            if (!$banner) {
                throw new Exception("Banner not found with ID: " . $id);
            }

            // Cập nhật thông tin của banner
            $banner->update([
                'title' => $data['title'] ?? $banner->title,
                'start_date' => $data['start_date'] ?? $banner->start_date,
                'end_date' => $data['end_date'] ?? $banner->end_date,
                'active' => $data['active'] ?? $banner->active
            ]);

            // Kiểm tra và xử lý các ảnh mới (thêm/xóa/cập nhật ảnh)
            if (isset($data['images']) && is_array($data['images'])) {
                // Lấy các ID ảnh mới
                $newImageIds = collect($data['images'])->pluck('id')->filter()->toArray();
    
                // Xóa ảnh không có trong danh sách mới
                $banner->images()->whereNotIn('id', $newImageIds)->delete();
    
                foreach ($data['images'] as $imageData) {
                    if (isset($imageData['id'])) {
                        // Cập nhật ảnh hiện có
                        BannerImage::where('id', $imageData['id'])->update([
                            'image_path' => $imageData['image_path'],
                            'title' => $imageData['title'] ?? null
                        ]);
                    } else {
                        // Thêm ảnh mới
                        $banner->images()->create([
                            'image_path' => $imageData['image_path'],
                            'title' => $imageData['title'] ?? null
                        ]);
                    }
                }
            }

            DB::commit();
            return $banner->load('images');  // Trả về banner cùng với ảnh
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Error updating banner: " . $e->getMessage());
        }
    }
    public function updateBannerImage($id, array $data)
    {
        return BannerImage::findOrFail($id)->update($data);
    }
    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $banner = Banner::findOrFail($id);

            // Xóa tất cả các banner_images liên quan
            $banner->images()->each(function ($image) {
                $image->delete();
            });

            // Xóa banner
            $banner->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception("Error deleting banner: " . $e->getMessage());
        }
    }
    public function deleteMultiple(array $ids)
    {
        return Banner::whereIn('id', $ids)->delete();
    }
}
