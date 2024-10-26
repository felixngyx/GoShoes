<?php

namespace App\Repositories;

use App\Repositories\RepositoryAbstracts\BaseRepositoryAbstract;
use App\Repositories\RepositoryInterfaces\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Redis;

class BaseRepository extends BaseRepositoryAbstract implements BaseRepositoryInterface
{
    protected $model;

    public function __construct(
        Model $model
    )
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->all();
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(array $data,int $id)
    {
        $record = $this->model->find($id);
        return $record->update($data);
    }

    public function delete(int $id)
    {
        return $this->model->destroy($id);
    }

    public function findById(int $id)
    {
        return $this->model->find($id)->findOrFail();
    }

    public function upsert(array $data, array $condition)
    {
        return $this->model->updateOrCreate($condition, $data);
    }

    public function forceDelete(int $id)
    {
        return $this->model->findById($id)->forceDelete();
    }

    protected static final function cacheTable()
    {
        $modelInstance = new static;
        $tableName = $modelInstance->model->getTable();
        $records = $modelInstance->model->all()->toArray();

        // Store the fetched data in Redis with the key '(name model)_table'
        Redis::set("{$tableName}_table", json_encode($records));
        Redis::expire("{$tableName}_table", 3600);

        return Redis::get("{$tableName}_table");
    }

    protected static final function getCachedTable()
    {
        $modelInstance = new static;
        $tableName = $modelInstance->model->getTable();
        $cachedRecords = (json_decode(Redis::get("{$tableName}_table"), true)) ?? $modelInstance->cacheTable();

        return response()->json($cachedRecords);
    }
}
