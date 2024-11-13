<?php

namespace App\Services\PostCategory;

use App\Models\PostCategory;
use Illuminate\Support\Facades\Log;
use App\Repositories\RepositoryInterfaces\PostCategoryRepositoryInterface;

use App\Models\VariantSize;
class PostCategoryService
{
    protected $postCategoryRepository;

    public function __construct(PostCategoryRepositoryInterface $postCategoryRepository)
    {
        $this->postCategoryRepository = $postCategoryRepository;
    }

    public function getAllCategories()
    {
        return PostCategory::select('id','name', 'slug')->get();
    }

    public function getCategoryById($id)
    {
        return $this->postCategoryRepository->findById($id);
    }

    public function createCategory(array $data)
    {
        return $this->postCategoryRepository->create($data);
    }

    public function updateCategory($id, array $data)
    {
        return $this->postCategoryRepository->update($id, $data);
    }

    public function deleteCategory($id)
    {
        return $this->postCategoryRepository->delete($id);
    }
    public function deleteCategories(array $ids){
        if (empty($ids)) {
            return response()->json(['message' => 'Không có ID nào được cung cấp!'], 400);
        }
        try {
            $deletedCount = $this->postCategoryRepository->deletePostCategoryByIds($ids);
            return response()->json(['message' => 'Đã xóa thành công ' . $deletedCount . ' PostCategory!'], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting PostCategory: ' . $e->getMessage());
            return response()->json(['message' => 'Có lỗi xảy ra khi xóa PostCategory.', 'error' => $e->getMessage()], 500);
        }
    }
}
