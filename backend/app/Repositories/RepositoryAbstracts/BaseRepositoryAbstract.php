<?php

namespace App\Repositories\RepositoryAbstracts;

abstract class BaseRepositoryAbstract
{
    abstract protected static function cacheTable();

    abstract protected static function getCachedTable();

}
