<?php
namespace App\Repositories;

use App\Models\Review;
use App\Repositories\RepositoryInterfaces\ReviewRepositoryInterface;

class ReviewRepository implements ReviewRepositoryInterface
{
    protected $model;

    public function __construct(Review $model)
    {
        $this->model = $model;
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(array $data, int $id)
    {
        $review = $this->model->findOrFail($id);
        $review->update($data);
        return $review;
    }

    public function delete(int $id)
    {
        return $this->model->destroy($id);
    }

    public function findById(int $id)
    {
        return $this->model->findOrFail($id);
    }

    public function getByProduct(int $productId, int $perPage = 10)
    {
        return $this->model->with('user')
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getByUser(int $userId, int $perPage = 10)
    {
        return $this->model->with('product')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function checkExistingReview(int $userId, int $productId)
    {
        return $this->model->where([
            'user_id' => $userId,
            'product_id' => $productId
        ])->exists();
    }
}
