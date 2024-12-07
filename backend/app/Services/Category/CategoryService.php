<?php

namespace App\Services\Category;

use App\Services\ServiceInterfaces\Category\CategoryServiceInterface;
use App\Repositories\RepositoryInterfaces\CategoryRepositoryInterface;

class CategoryService implements CategoryServiceInterface
{
    protected $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getAllCategories()
    {
        return $this->categoryRepository->all();
    }

    public function getCategoryById($id)
    {
        return $this->categoryRepository->findById($id);
    }

    public function createCategory(array $data)
    {
        return $this->categoryRepository->create($data);
    }

    public function updateCategory(array $data, $id)
    {
        return $this->categoryRepository->update($data, $id);
    }

    public function deleteCategory($id)
    {
        try {
            $category = $this->categoryRepository->findById($id);

            // Kiểm tra xem category có chứa sản phẩm không
            if ($category->products()->count() > 0) {
                throw new \Exception('You cannot delete this category because it contains products.');
            }

            return $this->categoryRepository->delete($id);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
}
