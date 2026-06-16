<?php

namespace App\Providers;

use App\Auth\LegacyEloquentUserProvider;
use App\Models\Bandwidth;
use App\Models\Plan;
use App\Observers\BandwidthObserver;
use App\Observers\PlanObserver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Custom provider that verifies legacy PHPMixBill crypt() passwords and
        // upgrades them to bcrypt on first successful login.
        Auth::provider('legacy-eloquent', function ($app, array $config) {
            return new LegacyEloquentUserProvider($app['hash'], $config['model']);
        });

        Bandwidth::observe(BandwidthObserver::class);
        Plan::observe(PlanObserver::class);
    }
}
