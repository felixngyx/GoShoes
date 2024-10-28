<?php

namespace App\Services\ServiceInterfaces\Category;

interface CategoryServiceInterface
{
    public function getAllCategories();
    
    public function getCategoryById($id);

    public function createCategory(array $data);

    public function updateCategory(array $data, $id);

    public function deleteCategory($id);
}
