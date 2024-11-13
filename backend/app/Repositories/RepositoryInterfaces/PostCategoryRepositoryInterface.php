<?php

namespace App\Repositories\RepositoryInterfaces;

use App\Models\PostCategory;


interface PostCategoryRepositoryInterface
{
    public function getAll();
    public function findById($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function deletePostCategoryByIds(array $ids);
}
