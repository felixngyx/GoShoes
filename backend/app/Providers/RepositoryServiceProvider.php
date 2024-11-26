<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\DiscountRepository;
use App\Services\DiscountService;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */

     public $bindings = [
        'App\Repositories\RepositoryInterfaces\UserRepositoryInterface' => 'App\Repositories\UserRepository',
        'App\Repositories\RepositoryInterfaces\PasswordChangeHistoryRepositoryInterface' => 'App\Repositories\PasswordChangeHistoryRepository',
        'App\Repositories\RepositoryInterfaces\CategoryRepositoryInterface' => 'App\Repositories\CategoryRepository',
        'App\Repositories\RepositoryInterfaces\TokenRepositoryInterface' => 'App\Repositories\TokenRepository',
        'App\Repositories\RepositoryInterfaces\CartRepositoryInterface' => 'App\Repositories\CartRepository',
        'App\Repositories\RepositoryInterfaces\WishlistRepositoryInterface' => 'App\Repositories\WishlistRepository',
        'App\Repositories\RepositoryInterfaces\ReviewRepositoryInterface' => 'App\Repositories\ReviewRepository',
        'App\Repositories\RepositoryInterfaces\DiscountRepositoryInterface' => 'App\Repositories\DiscountRepository',
        'App\Repositories\RepositoryInterfaces\ShippingRepositoryInterface' => 'App\Repositories\ShippingRepository',
        'App\Repositories\RepositoryInterfaces\ProductRepositoryInterface' => 'App\Repositories\ProductRepository',
        'App\Repositories\RepositoryInterfaces\ProductVariantRepositoryInterface' => 'App\Repositories\ProductVariantRepository',
        'App\Repositories\RepositoryInterfaces\ImageVariantRepositoryInterface' => 'App\Repositories\ImageVariantRepository',
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
