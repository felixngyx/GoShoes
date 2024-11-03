<?php


namespace App\Repositories\RepositoryInterfaces;
use App\Models\Brand;
interface BrandRepositoryInterface
{
    public function createBrand(array $data);
    public function findBrandById(int $id);
    public function updateBrand(int $id, array $data);  // Thêm hàm update
    public function deleteBrand(Brand $color);
    public function deleteBrandsByIds(array $ids);

}
