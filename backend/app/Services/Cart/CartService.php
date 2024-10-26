<?php

namespace App\Services\Cart;

use App\Repositories\RepositoryInterfaces\CartRepositoryInterface as CartRepository;
use App\Services\ServiceInterfaces\Cart\CartServiceInterface;

class CartService implements CartServiceInterface
{
    private $cartRepository;

    public function __construct(
        CartRepository $cartRepository
    )
    {
        $this->cartRepository = $cartRepository;
    }

    public function allService()
    {
        return $this->cartRepository->all();
    }

    public function createService(array $request)
    {
        try {
            $data = [
                'name' => $request['name'],
                'email' => $request['email'],
                'password' => bcrypt($request['password'])
            ];
            return $this->cartRepository->create($data);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function updateService(array $data, int $userId, int $productId)
    {
        try {
            return $this->cartRepository->upsert($data, ['user_id' => $userId, 'product_id' => $productId]);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    public function deleteService(int $id)
    {
        try {
            return $this->cartRepository->delete($id);
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }


}
