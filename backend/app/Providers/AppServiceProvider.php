<?php

namespace App\Providers;

use App\Repositories\BannerRepository;
use App\Repositories\BrandRepository;
use App\Repositories\ColorRepository;
use App\Repositories\PostCategoryRepository;
use App\Repositories\PostRepository;
use App\Repositories\ProductRepository;
use App\Repositories\RepositoryInterfaces\BannerRepositoryInterface;
use App\Repositories\RepositoryInterfaces\BrandRepositoryInterface;
use App\Repositories\RepositoryInterfaces\ColorRepositoryInterface;
use App\Repositories\RepositoryInterfaces\PostCategoryRepositoryInterface;
use App\Repositories\RepositoryInterfaces\PostRepositoryInterface;
use App\Repositories\RepositoryInterfaces\ProductRepositoryInterface;
use App\Repositories\RepositoryInterfaces\SizeRepositoryInterface;
use App\Repositories\SizeRepository;
use App\Repositories\PasswordChangeHistoryRepository;
use App\Repositories\RepositoryInterfaces\PasswordChangeHistoryRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public $bindings = [
        'App\Services\ServiceInterfaces\User\UserServiceInterface' => 'App\Services\User\UserService',
        'App\Services\ServiceInterfaces\Auth\AuthServiceInterface' => 'App\Services\Auth\AuthService',
        'App\Services\ServiceInterfaces\Verify\VerifyServiceInterface' => 'App\Services\Verify\VerifyService',
        'App\Services\ServiceInterfaces\Category\CategoryServiceInterface' => 'App\Services\Category\CategoryService',
        'App\Services\ServiceInterfaces\Token\TokenServiceInterface' => 'App\Services\Token\TokenService',
        'App\Services\ServiceInterfaces\Cart\CartServiceInterface' => 'App\Services\Cart\CartService',
        'App\Services\ServiceInterfaces\Wishlist\WishlistServiceInterface' => 'App\Services\Wishlist\WishlistService',
        'App\Services\ServiceInterfaces\Review\ReviewServiceInterface' => 'App\Services\Review\ReviewService',
        'App\Services\ServiceInterfaces\Shipping\ShippingServiceInterface' => 'App\Services\Shipping\ShippingService',
        'App\Services\ServiceInterfaces\Profile\ProfileServiceInterface' => 'App\Services\Profile\ProfileService',
        'App\Services\ServiceInterfaces\Product\ProductServiceInterface' => 'App\Services\Product\ProductService',
        'App\Services\ServiceInterfaces\ImageVariant\ImageVariantServiceInterface' => 'App\Services\ImageVariant\ImageVariantService',
        'App\Services\ServiceInterfaces\BaseServiceInterface' => 'App\Services\BaseService',
        'App\Services\ServiceInterfaces\ProductVariant\ProductVariantServiceInterface' => 'App\Services\ProductVariant\ProductVariantService',
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
        $this->app->bind(ColorRepositoryInterface::class, ColorRepository::class);
        $this->app->bind(SizeRepositoryInterface::class, SizeRepository::class);
        $this->app->bind(BrandRepositoryInterface::class, BrandRepository::class);
        $this->app->bind(PostCategoryRepositoryInterface::class, PostCategoryRepository::class);
        $this->app->bind(PostRepositoryInterface::class, PostRepository::class);
        $this->app->bind(BannerRepositoryInterface::class, BannerRepository::class);
        $this->app->bind('GuzzleHttp\Client', function($app) {
            return new \GuzzleHttp\Client([
                'verify' => true,
                'curl' => [
                    CURLOPT_SSL_VERIFYPEER => true,
                ],
            ]);
        });
        $this->app->bind(
            'App\Repositories\RepositoryInterfaces\PasswordChangeHistoryRepositoryInterface',
            'App\Repositories\PasswordChangeHistoryRepository'
        );
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
