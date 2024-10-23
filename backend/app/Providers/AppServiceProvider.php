<?php

namespace App\Providers;

use App\Repositories\ProductRepository;
use App\Repositories\RepositoryInterfaces\ProductRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public $bindings = [
        'App\Services\ServiceInterfaces\User\UserServiceInterface' => 'App\Services\User\UserService',
        'App\Services\ServiceInterfaces\Auth\AuthServiceInterface' => 'App\Services\Auth\AuthService',
        'App\Services\ServiceInterfaces\Verify\VerifyServiceInterface' => 'App\Services\Verify\VerifyService',
        'App\Services\ServiceInterfaces\PasswordChangeHistory\PasswordChangeHistoryServiceInterface' => 'App\Services\PasswordChangeHistory\PasswordChangeHistoryService',
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
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);

        $this->app->bind('GuzzleHttp\Client', function($app) {
            return new \GuzzleHttp\Client([
                'verify' => true,
                'curl' => [
                    CURLOPT_SSL_VERIFYPEER => true,
                ],
            ]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if(config('app.env') === 'local') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
