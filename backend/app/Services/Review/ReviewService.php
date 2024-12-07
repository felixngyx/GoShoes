<?php

namespace App\Services\Review;

use App\Models\Product;
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
            // Tạo review mới
            $reviewData = array_merge($data, ['user_id' => $userId]);
            $newReview = $this->reviewRepository->create($reviewData);

            // Lấy tất cả reviews
            $reviews = $this->reviewRepository->getByProduct($data['product_id'], 10);

            // Lấy mảng data từ paginator
            if ($reviews instanceof \Illuminate\Pagination\LengthAwarePaginator) {
                $reviewsArray = $reviews->items();

                // Tính tổng rating
                $totalRating = 0;
                foreach ($reviewsArray as $review) {
                    $totalRating += floatval($review['rating']);
                }

                // Cập nhật rating trung bình cho sản phẩm
                if (count($reviewsArray) > 0) {
                    $product = Product::find($data['product_id']);
                    $product->rating_count = min($totalRating / count($reviewsArray), 5);
                    $product->save();

                    \Log::info('Rating calculation:', [
                        'totalRating' => $totalRating,
                        'count' => count($reviewsArray),
                        'average' => $product->rating_count
                    ]);
                }
            }

            return $newReview;
        } catch (\Exception $e) {
            \Log::error('Review creation error:', ['error' => $e->getMessage()]);
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
