<?php

namespace App\Services\ServiceAbstracts;

use App\Repositories\BaseRepository;

abstract class BaseServiceAbstract
{
    protected static $repository;

    public function __construct()
    {
        self::setRepository(BaseRepository::class);
    }

    /**
     * @return mixed
     */
    public static function getRepository() : BaseRepository
    {
        return self::$repository;
    }

    /**
     * @param mixed $repository
     */
    public static function setRepository(BaseRepository $repository): void
    {
        self::$repository = $repository;
    }

    public function upsert(array $data, array $condition)
    {
        return static::getRepository()->upsert($data, $condition);
    }

    public function updateOrCreate(array $data, array $condition)
    {
        return static::getRepository()->updateOrCreate($data, $condition);
    }

    public function create(array $data)
    {
        return self::getRepository()->create($data);
    }

    public function createMany(array $data)
    {
        return self::getRepository()->createMany($data);
    }
}
