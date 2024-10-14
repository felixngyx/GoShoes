<?php

namespace App\Services\ServiceAbstract;
abstract class VerifyAbstract
{
    protected abstract function generateToken(array $user, string $type) : string;
}
