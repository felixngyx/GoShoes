<?php

namespace App\Services\Post;

use App\Repositories\PostRepository;
use App\Repositories\RepositoryInterfaces\PostRepositoryInterface;
class PostService
{
    protected $postRepository;

    public function __construct(PostRepositoryInterface $postRepository)
    {
        $this->postRepository = $postRepository;
    }

    public function getAllPosts()
    {
        return $this->postRepository->getAll();
    }

    public function getPostById($id)
    {
        return $this->postRepository->getById($id);
    }

    public function createPost(array $data)
    {
        return $this->postRepository->create($data);
    }

    public function updatePost($id, array $data)
    {
        return $this->postRepository->update($id, $data);
    }

    public function deletePost(string $id): bool
    {
        return $this->postRepository->delete($id);
    }
    public function deleteMultiplePosts(array $ids): bool
    {
        return $this->postRepository->deleteMultiple($ids);
    }
}