<?php

namespace App\Services\ServiceInterfaces;

Interface AuthServiceInterface
{
    public function login(array $request);

    public function logout(array $request);

    public function register(array $request);

}
