<?php

namespace App\Services\ServiceAbstracts\PasswordChangeHistory;

abstract class PasswordChangeHistoryAbstract
{
    protected abstract function create(array $data) : object;

    protected abstract function update(array $data, int $id) : object;

    protected abstract function delete(int $id) : int;

}
