<?php

namespace App\Services\ImageVariant;

use App\Services\ServiceAbstracts\ImageVariant\ImageVariantServiceAbstract;
use App\Services\ServiceInterfaces\ImageVariant\ImageVariantServiceInterface;
use App\Repositories\RepositoryInterfaces\ImageVariantRepositoryInterface as ImageVariantRepository;

class ImageVariantService extends ImageVariantServiceAbstract implements ImageVariantServiceInterface
{

    public function __construct()
    {
        parent::setRepository(app(ImageVariantRepository::class));
    }
}
