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

    public function index(Request $request): JsonResponse
    {
        try {
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 9);
            $orderBy = $request->input('orderBy', 'id');
            $order = $request->input('order', 'asc');

            $categories = $this->postCategoryService->getAllCategories($page, $limit, $orderBy, $order);

            if (!method_exists($categories, 'total')) {
                $totalItems = $categories->count();
                $totalPages = ceil($totalItems / $limit);

                return response()->json([
                    'success' => true,
                    'message' => $categories->isEmpty() ? 'Không có danh mục nào.' : 'Lấy danh sách danh mục thành công.',
                    'data' => [
                        'categories' => $categories->forPage($page, $limit)->values(),
                        'pagination' => [
                            'currentPage' => (int)$page,
                            'totalPages' => $totalPages,
                            'totalItems' => $totalItems,
                            'perPage' => (int)$limit,
                        ]
                    ]
                ]);
            }

            $totalItems = $categories->total();
            $totalPages = ceil($totalItems / $limit);

            if ($categories->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Không có danh mục nào.',
                    'data' => [
                        'categories' => [],
                        'pagination' => [
                            'currentPage' => $page,
                            'totalPages' => $totalPages,
                            'totalItems' => $totalItems,
                            'perPage' => $limit,
                        ]
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách danh mục thành công.',
                'data' => [
                    'categories' => $categories->items(),
                    'pagination' => [
                        'currentPage' => $categories->currentPage(),
                        'totalPages' => $totalPages,
                        'totalItems' => $totalItems,
                        'perPage' => $limit,
                    ]
                ]
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
                'message' => 'The category has been created successfully.',
                'data' => $category
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the category. May be the category name is already exists.',
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
                'message' => 'The category has been deleted successfully.'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'The category was not found.'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the category.' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function destroyMultiple(Request $request){
        $ids = $request->input('ids');
        return $this->postCategoryService->deleteCategories($ids);
    }
}
