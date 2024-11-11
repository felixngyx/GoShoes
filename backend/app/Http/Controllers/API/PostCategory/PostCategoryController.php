<?php

namespace App\Http\Controllers\API\PostCategory;

use App\Http\Controllers\Controller;
use App\Services\PostCategory\PostCategoryService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class PostCategoryController extends Controller
{
    protected $postCategoryService;

    public function __construct(PostCategoryService $postCategoryService)
    {
        $this->postCategoryService = $postCategoryService;
    }

    public function index(): JsonResponse
    {
        try {
            $categories = $this->postCategoryService->getAllCategories();
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách danh mục.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            $category = $this->postCategoryService->createCategory($data);
            return response()->json([
                'success' => true,
                'message' => 'Danh mục đã được tạo thành công.',
                'data' => $category
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo danh mục.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $category = $this->postCategoryService->getCategoryById($id);
            return response()->json([
                'success' => true,
                'data' => $category
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục này.'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin danh mục.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            $category = $this->postCategoryService->updateCategory($id, $data);
            return response()->json([
                'success' => true,
                'message' => 'Danh mục đã được cập nhật thành công.',
                'data' => $category
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục để cập nhật.'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật danh mục.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $this->postCategoryService->deleteCategory($id);
            return response()->json([
                'success' => true,
                'message' => 'Danh mục đã được xóa thành công.'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục để xóa.'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa danh mục.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
