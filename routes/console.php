<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Replaces the legacy system/cron.php (run every minute via crontab).
Schedule::command('airlink:expire-recharges')->everyMinute()->withoutOverlapping();
