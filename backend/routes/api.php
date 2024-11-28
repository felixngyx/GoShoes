<?php

use App\Events\NewOrderCreated;
use App\Http\Controllers\API\Auth\AuthController;
// use App\Http\Controllers\API\Shipping\ShippingController;
use App\Http\Controllers\API\Profile\ProfileController;
use App\Http\Controllers\API\Wishlist\WishlistController;
use App\Http\Controllers\API\Cart\CartController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Categories\CategoryController;
use App\Http\Controllers\API\Auth\SocialAuthController\FacebookAuthController;

use App\Http\Controllers\API\Colors\ColorController;
use App\Http\Controllers\API\Sizes\SizeController;
use App\Http\Controllers\API\Brands\BrandController;
use App\Http\Controllers\API\Contact\ContactController;
use App\Http\Controllers\API\Order\OrderController;
use App\Http\Controllers\API\Payments\ZaloPaymentController;
use App\Http\Controllers\API\Products\ProductController;
use App\Http\Controllers\API\Discount\DiscountController;
use App\Http\Controllers\API\Post\PostController;
use App\Http\Controllers\API\PostCategory\PostCategoryController;
use App\Http\Controllers\API\Products\ProductClientController;
use App\Http\Controllers\Api\Review\ReviewController;
use App\Http\Controllers\API\Shipping\ShippingController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\Order\RefundController;
use App\Http\Controllers\API\User\UserController;
use App\Http\Controllers\API\Statistical\StatisticalController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// This route is Public
Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthController::class, 'registerController']);
    Route::post('/register-verify', [AuthController::class, 'registerVerifyController']);
    Route::post('/login', [AuthController::class, 'loginController']);
    Route::post('/refresh-token', [AuthController::class, 'refreshTokenController'])->middleware('jwt.refresh.token');
    Route::post('/send-verify-email', [AuthController::class, 'sendEmailVerifyController'])->middleware('jwt.auth');
});

// API Product
Route::get('/products/trashed', [ProductController::class, 'trashedProducts']);
Route::post('/products/restore/{id}', [ProductController::class, 'restore']);
Route::post('/restore-multiple', [ProductController::class, 'restoreMultiple']);
Route::get('/products/{id}', [ProductController::class, 'show'])->where(['id' => '[0-9]+']);
Route::put('/products/{id}', [ProductController::class, 'updateProduct'])->where(['id' => '[0-9]+']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/productDetail/{id}', [ProductController::class, 'getDetailProduct']);
Route::post('/products', [ProductController::class, 'createProduct']);

Route::get('/product/{id}', [ProductClientController::class, 'show']);
Route::get('/product/variant/{id}/stock', [ProductController::class, 'checkStockProductVariant']);


// API Color

Route::get('/colors', [ColorController::class, 'index']);
Route::post('/colors', [ColorController::class, 'store']);
Route::get('/colors/{id}', [ColorController::class, 'show']);
Route::put('/colors/{id}', [ColorController::class, 'update']);
Route::delete('/colors/{id}', [ColorController::class, 'destroy']);
Route::delete('colors', [ColorController::class, 'destroyMultiple']);

// API Size
Route::get('/sizes', [SizeController::class, 'index']);
Route::post('/sizes', [SizeController::class, 'store']);
Route::get('/sizes/{id}', [SizeController::class, 'show']);
Route::put('/sizes/{id}', [SizeController::class, 'update']);
Route::delete('/sizes/{id}', [SizeController::class, 'destroy']);
Route::delete('sizes', [SizeController::class, 'destroyMultiple']);


Route::get('/brands', [BrandController::class, 'index']);
Route::post('/brands', [BrandController::class, 'store']);
Route::get('/brands/{id}', [BrandController::class, 'show']);
Route::put('/brands/{id}', [BrandController::class, 'update']);
Route::delete('/brands/{id}', [BrandController::class, 'destroy']);
Route::delete('brands', [BrandController::class, 'destroyMultiple']);

// API PostCategoryController
Route::get('/post-categories', [PostCategoryController::class, 'index']);
Route::post('/post-categories', [PostCategoryController::class, 'store']);
Route::get('/post-categories/{id}', [PostCategoryController::class, 'show']);
Route::put('/post-categories/{id}', [PostCategoryController::class, 'update']);
Route::delete('/post-categories/{id}', [PostCategoryController::class, 'destroy']);
Route::delete('post-categories', [PostCategoryController::class, 'destroyMultiple']);

// API Post
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);

// API Banner
Route::get('/banners', [BannerController::class, 'index']);
Route::post('/banners', [BannerController::class, 'store']);
Route::get('/banners/{id}', [BannerController::class, 'show']);
Route::put('/banners/{id}', [BannerController::class, 'update']);
Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
Route::delete('/banners', [BannerController::class, 'destroyMultiple']);

Route::get('categories', [CategoryController::class, 'index']);

// thống kê 
Route::get('/revenue/today', [StatisticalController::class, 'getTodayRevenue']);
Route::get('/revenue/monthly', [StatisticalController::class, 'getMonthlyRevenue']);
Route::get('/revenue/top-products', [StatisticalController::class, 'getTopRevenueProducts']);

//  Contact 
Route::get('/contacts', [ContactController::class, 'index']);
Route::post('/contacts', [ContactController::class, 'store']);
Route::get('/contacts/{id}', [ContactController::class, 'show']);
// This route is Public for all user change email and phone
Route::group(['prefix' => 'profile'], function () {
    Route::post('/verify-token-change-email', [ProfileController::class, 'verifyChangeEmail']);
    Route::post('/verify-token-change-phone', [ProfileController::class, 'verifyChangePhone']);
    Route::post('/reset-password-request', [AuthController::class, 'sendResetPasswordRequestController']);
    Route::post('/reset-password', [AuthController::class, 'resetPasswordController']);
    Route::post('/verify-token', [AuthController::class, 'verifyTokenController']);
});

// This route is Authenticated
Route::group([
    'middleware' => 'jwt.auth',
], function () {

    Route::group(['prefix' => 'profile'], function () {
        Route::get('/', [ProfileController::class, 'index']);
        Route::put('/update', [ProfileController::class, 'update']);
        Route::post('/change-detail-request', [ProfileController::class, 'changeDetailRequest']);
    });

    Route::post('/logout', [AuthController::class, 'logoutController']);

    Route::prefix('orders')->group(function () {
        Route::get('/all', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::get('/', [OrderController::class, 'OrderOneUser']);
        Route::post('/', [OrderController::class, 'store']);
        Route::put('/{id}', [OrderController::class, 'update']);
        Route::get('/{id}/check-payment', [OrderController::class, 'checkPaymentStatus']);
        Route::put('/{id}/update', [OrderController::class, 'UpdateOrder']);
        Route::post('/{id}/renew-payment', [OrderController::class, 'renewPaymentLink']);
    });

    Route::prefix('discounts')->group(function () {
        Route::get('/', [DiscountController::class, 'index']);
        Route::post('/', [DiscountController::class, 'store']);
        Route::get('/{id}', [DiscountController::class, 'show']);
        Route::put('/{id}', [DiscountController::class, 'update']);
        Route::delete('/{id}', [DiscountController::class, 'destroy']);
        Route::post('/validate', [DiscountController::class, 'validateCode']);
        Route::patch('/{id}/status', [DiscountController::class, 'updateStatus']);
        Route::get('/{id}/statistics', [DiscountController::class, 'getStatistics']);
        Route::post('/apply', [DiscountController::class, 'applyDiscount']);
    });

    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/', [WishlistController::class, 'store']);
        Route::delete('/', [WishlistController::class, 'destroy']);
    });

    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/', [CartController::class, 'store']);
        Route::delete('/', [CartController::class, 'destroy']);
        Route::put('/', [CartController::class, 'update']);
    });

    // API review
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::get('/user/reviews', [ReviewController::class, 'userReviews']);



    Route::post('categories', [CategoryController::class, 'store']);
    Route::get('categories/{id}', [CategoryController::class, 'show']);
    Route::put('categories/{id}', [CategoryController::class, 'update']);
    Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

    // API Wishlist
    Route::resource('wishlist', WishlistController::class);

    // API Cart
    Route::resource('cart', CartController::class);

    //API Shipping
    Route::resource('shipping', ShippingController::class);

    Route::prefix('posts')->group(function () {
        Route::post('/', [PostController::class, 'store']);
        Route::put('/{id}', [PostController::class, 'update']);
        Route::delete('/{id}', [PostController::class, 'destroy']);
        Route::delete('/', [PostController::class, 'destroyMultiple']);
    });


    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    Route::prefix('refunds')->group(function () {
        Route::get('/', [RefundController::class, 'index']);
        Route::post('/', [RefundController::class, 'store']);
        Route::post('/approve', [RefundController::class,'approve']);
        Route::post('/deny', [RefundController::class,'deny']);
        Route::get('/static', [RefundController::class,'getRefundStatistics']);
        Route::get('/{id}', [RefundController::class, 'viewDetailRefundRequest']);
    });
});

// Routes cho Payment với ZaloPay
Route::prefix('payment')->group(function () {
    Route::get('/callback', [ZaloPaymentController::class, 'callback'])->name('payment.callback');

    Route::prefix('check')->group(function () {
        Route::post('/status', [ZaloPaymentController::class, 'searchStatus']);
        Route::post('/list-status', [ZaloPaymentController::class, 'batchSearchStatus']);
    });
});

// Admin routes
Route::group([
    'prefix' => '/admin',
    'middleware' => 'authorize'
], function () {
    Route::prefix('/user')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
        Route::delete('/', [UserController::class, 'destroyMultiple']);
    });
});

Route::post('/auth/facebook-login', [FacebookAuthController::class, 'loginWithFacebook']);

// API review
Route::get('/products/{id}/reviews', [ReviewController::class, 'productReviews']);
