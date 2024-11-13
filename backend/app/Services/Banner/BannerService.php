<?php

namespace App\Services\Banner;

use App\Repositories\RepositoryInterfaces\BannerRepositoryInterface;
use Exception;

class BannerService
{
    protected $bannerRepository;

    public function __construct(BannerRepositoryInterface $bannerRepository)
    {
        $this->bannerRepository = $bannerRepository;
    }

    public function getAllBanners()
    {
        return $this->bannerRepository->getAll();
    }

    public function getBannerById($id)
    {
        return $this->bannerRepository->getById($id);
    }

    public function createBanner(array $data)
    {
        try {
            return $this->bannerRepository->create($data);
        } catch (Exception $e) {
            throw new Exception("Error creating banner: " . $e->getMessage());
        }
    }

    public function updateBanner($id, array $data)
    {
        try {
            return $this->bannerRepository->update($id, $data);
        } catch (Exception $e) {
            throw new Exception("Error updating banner: " . $e->getMessage());
        }
    }

    public function deleteBanner($id)
    {
        try {
            return $this->bannerRepository->delete($id);
        } catch (Exception $e) {
            throw new Exception("Error deleting banner: " . $e->getMessage());
        }
    }
}
