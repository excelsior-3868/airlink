<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Reference / configuration tables.
 * Legacy sources: tbl_appconfig, tbl_bandwidth, tbl_routers, tbl_pool, tbl_language.
 */
return new class extends Migration
{
    public function up(): void
    {
        // tbl_appconfig -> settings (key/value)
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->mediumText('value')->nullable();
            $table->timestamps();
        });

        // tbl_bandwidth -> bandwidths
        Schema::create('bandwidths', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('rate_down');
            $table->enum('rate_down_unit', ['Kbps', 'Mbps']);
            $table->unsignedInteger('rate_up');
            $table->enum('rate_up_unit', ['Kbps', 'Mbps']);
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });

        // tbl_routers -> routers (credentials encrypted at the model layer)
        Schema::create('routers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('ip_address', 128);
            $table->string('username', 50);
            $table->text('password');               // encrypted cast
            $table->unsignedInteger('api_port')->default(8728);
            $table->boolean('use_ssl')->default(false);
            $table->string('description', 100)->nullable();
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });

        // tbl_pool -> pools
        Schema::create('pools', function (Blueprint $table) {
            $table->id();
            $table->string('pool_name', 40);
            $table->string('range_ip', 40);
            $table->string('router_name', 40);
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });

        // tbl_language -> languages
        Schema::create('languages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 32);
            $table->string('folder', 32);
            $table->string('author', 60)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('languages');
        Schema::dropIfExists('pools');
        Schema::dropIfExists('routers');
        Schema::dropIfExists('bandwidths');
        Schema::dropIfExists('settings');
    }
};
