<?php
namespace App\Repositories\RepositoryInterfaces;

interface ShippingRepositoryInterface
{
    public function checkDefaultExits();
    public function getRecordByUserIdAndId(int $userId, int $id);

    public function checkShippingInOrder(int $id);
}
