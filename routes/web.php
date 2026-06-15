<?php

use App\Http\Controllers\BandwidthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PoolController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RechargeController;
use App\Http\Controllers\RouterController;
use App\Http\Controllers\VoucherController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', DashboardController::class)
    ->middleware('auth')
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Customer management (admin + sales).
    Route::middleware('role:admin,sales')->group(function () {
        Route::post('customers/bulk-action', [CustomerController::class, 'bulkAction'])
            ->name('customers.bulk-action');
        Route::resource('customers', CustomerController::class);

        // Vouchers + recharge (admin + sales).
        Route::get('vouchers', [VoucherController::class, 'index'])->name('vouchers.index');
        Route::get('vouchers/generate', [VoucherController::class, 'create'])->name('vouchers.create');
        Route::post('vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
        Route::delete('vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');

        Route::get('customers/{customer}/recharge', [RechargeController::class, 'create'])->name('recharge.create');
        Route::post('customers/{customer}/recharge', [RechargeController::class, 'store'])->name('recharge.store');
    });

    // Network/plan configuration (admin only).
    Route::middleware('role:admin')->group(function () {
        Route::resource('bandwidth', BandwidthController::class)->except('show')->parameters(['bandwidth' => 'bandwidth']);
        Route::resource('plans', PlanController::class)->except('show');
        Route::resource('routers', RouterController::class)->except('show');
        Route::resource('pools', PoolController::class)->except('show');
    });
});

require __DIR__.'/auth.php';
