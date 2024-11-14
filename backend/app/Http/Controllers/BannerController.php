<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Exception;
use App\Services\Banner\BannerService;

class BannerController extends Controller
{
    protected $bannerService;

    public function __construct(BannerService $bannerService)
    {
        $this->bannerService = $bannerService;
    }

    public function index()
    {
        try {
            $banners = $this->bannerService->getAllBanners();
            return response()->json(['success' => true, 'message' => 'Lấy danh sách banners thành công.', 'data' => $banners]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không thể lấy danh sách banners.', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'active' => 'required|boolean',
            'images' => 'sometimes|array',
            'images.*' => 'required|string|max:255',
        ]);

        try {
            $banner = $this->bannerService->createBanner($request->all());
            return response()->json(['success' => true, 'message' => 'Tạo banner thành công.', 'data' => $banner]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không thể tạo banner.', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $banner = $this->bannerService->getBannerById($id);
            return response()->json(['success' => true, 'message' => 'Lấy thông tin banner thành công.', 'data' => $banner]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không thể tìm thấy banner.', 'error' => $e->getMessage()], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'active' => 'nullable|boolean',
            'images' => 'nullable|array', // Đảm bảo images là mảng
            'images.*.image_path' => 'required|string', // image_path phải là chuỗi
        ]);

        try {
            $banner = $this->bannerService->updateBanner($id, $request->all());
            return response()->json(['success' => true, 'message' => 'Cập nhật banner thành công.', 'data' => $banner]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không thể cập nhật banner.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->bannerService->deleteBanner($id);
            return response()->json(['success' => true, 'message' => 'Xóa banner thành công.']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không thể xóa banner.', 'error' => $e->getMessage()], 500);
        }
    }
    public function destroyMultiple(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $this->bannerService->deleteMultipleBanners($request->ids);
        return response()->json(['success' => true, 'message' => 'Xóa banner thành công.']);
    }
}
