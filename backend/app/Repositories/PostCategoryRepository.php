<?php

namespace App\Repositories;

use App\Models\PostCategory;

use App\Repositories\RepositoryInterfaces\PostCategoryRepositoryInterface;
use Illuminate\Support\Facades\Storage;
   
class PostCategoryRepository implements PostCategoryRepositoryInterface
{
    protected $postCategory;

    public function __construct(PostCategory $postCategory)
    {
        $this->postCategory = $postCategory;
    }

    public function getAll()
    {
        return $this->postCategory->all();
    }

    public function findById($id)
    {
        return $this->postCategory->findOrFail($id);
    }

    public function create(array $data)
    {
        $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        return $this->postCategory->create($data);
    }

    public function update($id, array $data)
    {
        $postCategory = $this->findById($id);
        $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        $postCategory->update($data);
        return $postCategory;
    }

    public function delete($id)
    {
        $postCategory = $this->findById($id);
        return $postCategory->delete();
    }
}