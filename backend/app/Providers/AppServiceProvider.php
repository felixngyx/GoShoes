<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public $bindings = [
        'App\Services\ServiceInterfaces\UserServiceInterface' => 'App\Services\UserService',
        'App\Services\ServiceInterfaces\AuthServiceInterface' => 'App\Services\AuthService',
        'App\Repositories\RepositoryInterfaces\CategoryRepositoryInterface' => 'App\Repositories\CategoryRepository',
    ];
    /**
     * Register any application services.
     */
    public function register(): void
    {
        foreach($this->bindings as $key => $val)
        {
            $this->app->bind($key, $val);
        }

        $this->app->register(RepositoryServiceProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
    }
}
