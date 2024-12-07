<?php

namespace App\Repositories;

use App\Models\Post;
use App\Repositories\RepositoryInterfaces\PostRepositoryInterface;
use Illuminate\Support\Facades\Log;

class PostRepository implements PostRepositoryInterface
{
    public function getAll()
    {
        try {
            return Post::with(['author:id,name', 'category:id,name'])
                ->select('id', 'title', 'image', 'content', 'slug', 'category_id', 'author_id', 'scheduled_at', 'published_at', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'image' => $post->image,
                        'content' => $post->content,
                        'slug' => $post->slug,
                        'scheduled_at' => $post->scheduled_at,
                        'published_at' => $post->published_at,
                        'author_name' => $post->author ? $post->author->name : 'N/A',
                        'category_id' => $post->category_id,
                        'category_name' => $post->category ? $post->category->name : 'N/A',
                        'created_at' => $post->created_at,
                    ];
                });
        } catch (\Exception $e) {
            Log::error('Error getting all posts: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getById($id)
    {
        try {
            $post = Post::with(['author:id,name', 'category:id,name'])
                ->select('id', 'title', 'image', 'content', 'slug', 'category_id', 'author_id', 'scheduled_at', 'published_at')
                ->find($id);

            if (!$post) {
                return null;
            }

            return [
                'id' => $post->id,
                'title' => $post->title,
                'image' => $post->image,
                'content' => $post->content,
                'slug' => $post->slug,
                'scheduled_at' => $post->scheduled_at,
                'published_at' => $post->published_at,
                'author_name' => $post->author ? $post->author->name : 'N/A',
                'category_id' => $post->category_id,
                'category_name' => $post->category ? $post->category->name : 'N/A',
            ];
        } catch (\Exception $e) {
            Log::error('Error getting post by ID: ' . $e->getMessage());
            throw $e;
        }
    }

    public function create(array $data)
    {
        return Post::create($data);
    }

    public function update($id, array $data)
    {
        try {
            $post = Post::find($id);

            if ($post) {
                $post->update($data);
                return $post;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error updating post: ' . $e->getMessage());
            throw $e;
        }
    }
    public function delete($id)
    {
        try {
            $post = Post::find($id);
            if ($post) {
                $post->delete();
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Error deleting post: ' . $e->getMessage());
            throw $e;
        }
    }
    public function deleteMultiple(array $ids){
        return Post::whereIn('id', $ids)->delete();
    }
}
