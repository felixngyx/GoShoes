<?php

namespace App\Services\ServiceAbstracts\ImageVariant;

use App\Repositories\RepositoryInterfaces\ImageVariantRepositoryInterface as ImageVariantRepository;
use App\Services\ServiceAbstracts\BaseServiceAbstract;

abstract class ImageVariantServiceAbstract extends BaseServiceAbstract
{
    public function __construct()
    {
        parent::setRepository(app(ImageVariantRepository::class));
    }
}
