<?php
namespace App\Repositories;
use App\Models\Brand;
use App\Repositories\RepositoryInterfaces\BrandRepositoryInterface;
class BrandRepository implements BrandRepositoryInterface {
    public function createBrand(array $data) {
        return Brand::create($data);
    }
    public function findBrandById(int $id) {
        return Brand::find($id);
    }
    public function updateBrand(int $id, array $data) {
        $brand = $this->findBrandById($id);
      
        if ($brand) {
            $brand->update($data);
            return $brand;
        }
        return null;
    }
    public function deleteBrand(Brand $brand) {
        return $brand->delete();
    }
}
