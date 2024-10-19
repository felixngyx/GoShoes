<?php

namespace App\Repositories;

use App\Repositories\RepositoryInterfaces\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

class BaseRepository implements BaseRepositoryInterface
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
        return $this->model->find($id);
    }



}
