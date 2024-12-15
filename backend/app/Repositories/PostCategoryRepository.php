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
        // Kiểm tra xem category có chứa bàipost nào không
        if ($postCategory->posts()->count() > 0) {
            throw new \Exception('This category cannot be deleted because it contains posts.');
        }
        return $postCategory->delete();
    }

    public function deletePostCategoryByIds(array $ids)
    {
        // Kiểm tra tất cả category được chọn
        $categoriesWithPosts = $this->postCategory->whereIn('id', $ids)
            ->withCount('posts')
            ->having('posts_count', '>', 0)
            ->get();

        if ($categoriesWithPosts->isNotEmpty()) {
            throw new \Exception('Không thể xóa danh mục vì nó chứa bài viết.');
        }

        return $this->postCategory->whereIn('id', $ids)->delete();
    }

}
