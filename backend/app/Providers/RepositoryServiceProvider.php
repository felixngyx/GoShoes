<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */

     public $bindings = [
       'App\Repositories\RepositoryInterfaces\UserRepositoryInterface' => 'App\Repositories\UserRepository',
        'App\Repositories\RepositoryInterfaces\TokenRepositoryInterface' => 'App\Repositories\TokenRepository',
    ];

    public function register(): void
    {
        foreach($this->bindings as $key => $val)
        {
            $this->app->bind($key, $val);
        }
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
