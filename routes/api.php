<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerApiController;
use App\Http\Controllers\Api\RechargeApiController;
use Illuminate\Support\Facades\Route;

/*
| Versioned JSON API for mobile clients (Flutter). Token auth via Sanctum.
| Controllers are thin and delegate to the same services as the web side.
*/

Route::prefix('v1')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);

        Route::get('customers', [CustomerApiController::class, 'index']);
        Route::get('customers/{customer}', [CustomerApiController::class, 'show']);

        Route::get('plans', [RechargeApiController::class, 'plans']);
        Route::post('customers/{customer}/recharge', [RechargeApiController::class, 'recharge']);
    });
});
