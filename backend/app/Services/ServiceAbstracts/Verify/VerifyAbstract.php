<?php

namespace App\Services\ServiceAbstracts\Verify;
abstract class VerifyAbstract
{
    protected abstract static function encryptToken(object $user, string $type) : string;

    abstract protected static function decryptToken(string $token) : object;
}
