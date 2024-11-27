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

    public function getAllWithCustomWhere(
        array $column = ['*'],
        array $condition = [],
        int $perPage = 1,
        array $extend = [],
        array $orderBy = ['id', 'DESC'],
        array $join = [],
        array $relations = [],
        array $rawQuery = []
    )
    {
        $query = $this->model->select($column);
        return $query
            ->keyword($condition['keyword'] ?? null)
            ->publish($condition['publish'] ?? null)
            ->relation($relations ?? null)
            ->CustomWhere($condition['where'] ?? null)
            ->customWhereRaw($rawQuery['whereRaw'] ?? null)
            ->customJoin($join ?? null)
            ->customGroupBy($extend['groupBy'] ?? null)
            ->customOrderBy($orderBy ?? null)
            ->paginate($perPage)->toSql();
    }

    public function all()
    {
        return $this->model->all()->where('is_deleted', false);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(array $data,int $id)
    {
        return $this->model->find($id)->update($data);
    }

    public function delete(int $id)
    {
        return $this->model->destroy($id);
    }

    public function findById(int $id)
    {
        return $this->model->findOrFail($id);
    }

    public function upsert(array $data, array $condition)
    {
        return $this->model->upsert($data, $condition);
    }

    public function updateOrCreate(array $data, array $condition)
    {
        return $this->model->updateOrCreate($data, $condition);
    }

    public function forceDelete(int $id)
    {
        return $this->findById($id)->forceDelete();
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

    protected static final function getCachedTable(array $columns = [], array $condition = [])
    {
        $modelInstance = new static;
        $tableName = $modelInstance->model->getTable();
        $cachedRecords = (json_decode(Redis::get("{$tableName}_table"), true)) ?? $modelInstance->cacheTable();
        if (!empty($columns)) {
            if (!empty($condition) && count($condition) > 0) {
                $cachedRecords = array_filter($cachedRecords, function ($record) use ($columns, $condition) {
                    $filtered = true;
                    foreach ($condition as $key => $value) {
                        if ($record[$key] != $value) {
                            $filtered = false;
                            break;
                        }
                    }
                    return $filtered;
                });
            }
        }
        return response()->json($cachedRecords);
    }

    public static final function getDataFromCache(array $columns, array $condition)
    {
        return self::getCachedTable();
    }

    public function getListByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)->get();
    }

    public function createMany(array $data)
    {
        return $this->model->insert($data);
    }

    public function updateMany(array $data, int $id)
    {
        return $this->model->whereIn('id', $id)->update($data);
    }
}
