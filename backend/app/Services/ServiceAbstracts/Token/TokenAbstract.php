<?php

namespace App\Services\ServiceAbstracts\Token;

abstract class TokenAbstract
{
    abstract public function create(array $data);

    abstract public function update(array $data, int $id);

    abstract public function delete(int $id);
}
