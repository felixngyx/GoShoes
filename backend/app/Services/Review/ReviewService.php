<?php

namespace App\Services\Review;

use App\Repositories\RepositoryInterfaces\ReviewRepositoryInterface;
use App\Services\ServiceInterfaces\Review\ReviewServiceInterface;
use App\Exceptions\ReviewException;
use Illuminate\Support\Facades\DB;

class ReviewService implements ReviewServiceInterface
{
    protected $reviewRepository;

    public function __construct(ReviewRepositoryInterface $reviewRepository)
    {
        $this->reviewRepository = $reviewRepository;
    }

    public function createReview(array $data, int $userId)
    {
        try {
            // Kiểm tra xem user đã mua sản phẩm chưa
            $hasPurchased = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.user_id', $userId)
                ->where('order_items.product_id', $data['product_id'])
                ->where('orders.status', 'completed')
                ->exists();

            if (!$hasPurchased) {
                throw new ReviewException('You must purchase the product before reviewing');
            }

            $reviewData = array_merge($data, ['user_id' => $userId]);
            return $this->reviewRepository->create($reviewData);

        } catch (\Exception $e) {
            throw new ReviewException($e->getMessage());
        }
    }

    public function updateReview(array $data, int $reviewId, int $userId)
    {
        try {
            $review = $this->reviewRepository->findById($reviewId);
            
            if ($review->user_id !== $userId) {
                throw new ReviewException('Unauthorized to update this review');
            }

            return $this->reviewRepository->update($data, $reviewId);

        } catch (\Exception $e) {
            throw new ReviewException($e->getMessage());
        }
    }

    public function deleteReview(int $reviewId, int $userId)
    {
        try {
            $review = $this->reviewRepository->findById($reviewId);
            
            if ($review->user_id !== $userId) {
                throw new ReviewException('Unauthorized to delete this review');
            }

            return $this->reviewRepository->delete($reviewId);

        } catch (\Exception $e) {
            throw new ReviewException($e->getMessage());
        }
    }

    public function getProductReviews(int $productId, int $perPage = 10)
    {
        try {
            return $this->reviewRepository->getByProduct($productId, $perPage);
        } catch (\Exception $e) {
            throw new ReviewException($e->getMessage());
        }
    }

    public function getUserReviews(int $userId, int $perPage = 10)
    {
        try {
            return $this->reviewRepository->getByUser($userId, $perPage);
        } catch (\Exception $e) {
            throw new ReviewException($e->getMessage());
        }
    }
}