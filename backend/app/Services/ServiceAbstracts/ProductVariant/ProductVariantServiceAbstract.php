<?php

namespace App\Services\ServiceAbstracts\ProductVariant;

use App\Repositories\RepositoryInterfaces\ProductVariantRepositoryInterface as ProductVariantRepository;
use App\Services\ServiceAbstracts\BaseServiceAbstract;

class ProductVariantServiceAbstract extends BaseServiceAbstract
{

    public function __construct()
    {
        parent::setRepository(app(ProductVariantRepository::class));
    }
}
