<?php

namespace App\Services\ServiceInterfaces\Review;

interface ReviewServiceInterface
{
    public function createReview(array $data, int $userId);
    public function updateReview(array $data, int $reviewId, int $userId);
    public function deleteReview(int $reviewId, int $userId);
    public function getProductReviews(int $productId, int $perPage = 10);
    public function getUserReviews(int $userId, int $perPage = 10);
}