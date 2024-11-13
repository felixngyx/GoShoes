<?php
namespace App\Repositories;

use App\Models\Shipping;
use App\Repositories\RepositoryInterfaces\ShippingRepositoryInterface;

class ShippingRepository extends BaseRepository implements ShippingRepositoryInterface
{
    public function __construct(
        Shipping $model
    )
    {
        parent::__construct($model);
    }

    public function checkDefaultExits()
    {
        return $this->model->where('is_default', true)->get();
    }

    public function getRecordByUserIdAndId(int $userId, int $id)
    {
        return $this->model->where('user_id', $userId)->where('id', $id)->first();
    }

    public function checkShippingInOrder(int $id)
    {
        return $this->model->whereHas('orders', function ($query) use ($id) {
            $query->where('shipping_id', $id)->whereIn('status', ['pending', 'processing']);
        })->first();
    }
}
