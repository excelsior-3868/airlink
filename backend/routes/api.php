<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BandwidthApiController;
use App\Http\Controllers\Api\CustomerApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\MessageApiController;
use App\Http\Controllers\Api\MonitorApiController;
use App\Http\Controllers\Api\PlanApiController;
use App\Http\Controllers\Api\PoolApiController;
use App\Http\Controllers\Api\RechargeApiController;
use App\Http\Controllers\Api\ReportApiController;
use App\Http\Controllers\Api\RouterApiController;
use App\Http\Controllers\Api\IpBindingApiController;
use App\Http\Controllers\Api\SettingApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\VoucherApiController;
use App\Http\Controllers\Api\WalletApiController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\ComplaintApiController;
use App\Http\Controllers\Api\ComplaintRemarkApiController;
use App\Http\Controllers\Api\CMSCategoryController;
use App\Http\Controllers\Api\CMSStateController;
use App\Http\Controllers\Api\CustomPagesController;
use App\Http\Controllers\SetupController;
use Illuminate\Support\Facades\Route;

/*
| Versioned JSON API for SPA + mobile clients. Token auth via Sanctum.
| and custom token-cache for customers.
*/

Route::name('api.')->prefix('v1')->group(function () {
    // Auth & Login
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('customer/login', [CustomerAuthController::class, 'login'])->middleware('throttle:10,1');

    // Installation Wizard
    Route::get('install/precheck', [SetupController::class, 'precheck']);
    Route::post('install/database', [SetupController::class, 'database']);
    Route::post('install/migrate', [SetupController::class, 'migrate']);
    Route::post('install/admin', [SetupController::class, 'admin']);

    // Customer Portal Routes (Protected)
    Route::middleware('auth:customer-api')->group(function () {
        Route::get('customer/me', [CustomerAuthController::class, 'me']);
        Route::post('customer/logout', [CustomerAuthController::class, 'logout']);
        Route::get('customer/dashboard', [CustomerAuthController::class, 'dashboard']);
        Route::post('customer/change-password', [CustomerAuthController::class, 'changePassword']);
        Route::post('customer/recharge', [CustomerAuthController::class, 'recharge']);

        // Custom Static Pages (Customer Portal View)
        Route::get('customer/pages', [CustomPagesController::class, 'index']);
        Route::get('customer/pages/{slug}', [CustomPagesController::class, 'show']);

        // Customer Tickets
        Route::get('customer/categories', CMSCategoryController::class . '@index');
        Route::get('customer/states', CMSStateController::class . '@index');
        Route::apiResource('customer/complaints', ComplaintApiController::class)->only(['index', 'store', 'show']);
        Route::post('customer/complaints/{complaint}/remarks', [ComplaintRemarkApiController::class, 'store']);
    });

    // Staff Portal Routes (Protected)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('dashboard', DashboardApiController::class);

        // Messaging - all staff
        Route::get('messages/recipients', [MessageApiController::class, 'recipients']);
        Route::apiResource('messages', MessageApiController::class);

        // CMS Tickets - all staff (Admin and Sales)
        Route::apiResource('complaints', ComplaintApiController::class);
        Route::post('complaints/{complaint}/remarks', [ComplaintRemarkApiController::class, 'store']);

        // Sales / Admins / POS
        Route::middleware('role:admin,sales,pos')->group(function () {
            Route::post('customers/bulk-action', [CustomerApiController::class, 'bulkAction']);
            Route::post('customers/{customer}/reset-mac', [CustomerApiController::class, 'resetMac']);
            Route::apiResource('customers', CustomerApiController::class);

            Route::get('vouchers/options', [VoucherApiController::class, 'options']);
            Route::get('vouchers/allocations', [VoucherApiController::class, 'allocations']);
            Route::post('vouchers/allocate', [VoucherApiController::class, 'allocate']);
            Route::apiResource('vouchers', VoucherApiController::class)->only(['index', 'store', 'destroy']);

            Route::get('recharge/plans', [RechargeApiController::class, 'plans']);
            Route::post('recharge/bulk', [RechargeApiController::class, 'bulkRecharge']);
            Route::post('customers/{customer}/recharge', [RechargeApiController::class, 'recharge']);

            Route::get('wallet', [WalletApiController::class, 'index']);
        });

        // Sales / Admins Only
        Route::middleware('role:admin,sales')->group(function () {
            Route::get('users/options', [UserApiController::class, 'options']);
            Route::get('reports/billings', [ReportApiController::class, 'billings']);
            Route::get('reports', [ReportApiController::class, 'index']);
        });

        // Admins only
        Route::middleware('role:admin')->group(function () {
            Route::get('plans/options', [PlanApiController::class, 'options']);
            Route::apiResource('plans', PlanApiController::class);

            Route::apiResource('bandwidth', BandwidthApiController::class);

            Route::get('pools/options', [PoolApiController::class, 'options']);
            Route::apiResource('pools', PoolApiController::class);

            Route::get('routers/{router}/logs', [RouterApiController::class, 'logs']);
            Route::apiResource('routers', RouterApiController::class);

            Route::apiResource('ip-bindings', IpBindingApiController::class);

            Route::post('wallet/load', [WalletApiController::class, 'load']);

            Route::get('monitor/sessions', [MonitorApiController::class, 'sessions']);
            Route::get('monitor/logs', [MonitorApiController::class, 'logs']);

            Route::apiResource('users', UserApiController::class);
            Route::get('settings', [SettingApiController::class, 'index']);
            Route::post('settings', [SettingApiController::class, 'update']);

            Route::get('backup/export', [\App\Http\Controllers\Api\BackupApiController::class, 'export']);
            Route::post('backup/import', [\App\Http\Controllers\Api\BackupApiController::class, 'import']);

            // CMS Settings - Admin only
            Route::apiResource('cms/categories', CMSCategoryController::class);
            Route::post('cms/subcategories', [CMSCategoryController::class, 'storeSubcategory']);
            Route::delete('cms/subcategories/{id}', [CMSCategoryController::class, 'destroySubcategory']);
            Route::apiResource('cms/states', CMSStateController::class);
        });
    });
});
