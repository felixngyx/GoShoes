<?php

namespace App\Repositories;

use App\Repositories\RepositoryInterfaces\CategoryRepositoryInterface;
use App\Models\Category;

class CategoryRepository extends BaseRepository implements CategoryRepositoryInterface
{
    public function __construct(Category $category)
    {
        parent::__construct($category);
    }
}