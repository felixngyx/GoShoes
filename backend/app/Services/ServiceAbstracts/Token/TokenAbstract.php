<?php

namespace App\Services\ServiceAbstracts\Token;

abstract class TokenAbstract
{
    protected abstract function create(array $data) : object;

    protected abstract function update(array $data, int $id) : object;

    protected abstract function delete(int $id) : int;

}
