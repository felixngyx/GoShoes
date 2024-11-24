<?php

namespace App\Repositories;

use App\Repositories\RepositoryInterfaces\CategoryRepositoryInterface;
use App\Models\ImageVariant;

class ImageVariantRepository extends BaseRepository implements CategoryRepositoryInterface
{
    public function __construct(ImageVariant $imageVariant)
    {
        parent::__construct($imageVariant);
    }
}
