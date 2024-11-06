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
        return PostCategory::select('name', 'slug')->get();
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
}