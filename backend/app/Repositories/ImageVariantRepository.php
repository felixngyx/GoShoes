<?php

namespace App\Repositories;

use App\Models\ImageVariant;
use App\Repositories\RepositoryInterfaces\ImageVariantRepositoryInterface;

class ImageVariantRepository extends BaseRepository implements ImageVariantRepositoryInterface
{
    public function __construct(ImageVariant $imageVariant)
    {
        parent::__construct($imageVariant);
    }
}
