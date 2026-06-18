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
        // tbl_appconfig
        Schema::create('tbl_appconfig', function (Blueprint $table) {
            $table->increments('id');
            $table->mediumText('setting');
            $table->mediumText('value')->nullable();
        });

        // tbl_bandwidth
        Schema::create('tbl_bandwidth', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name_bw', 255);
            $table->unsignedInteger('rate_down');
            $table->enum('rate_down_unit', ['Kbps', 'Mbps']);
            $table->unsignedInteger('rate_up');
            $table->enum('rate_up_unit', ['Kbps', 'Mbps']);
        });

        // tbl_routers
        Schema::create('tbl_routers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 32);
            $table->string('ip_address', 128);
            $table->string('username', 50);
            $table->text('password');
            $table->string('description', 50)->nullable();
        });

        // tbl_pool
        Schema::create('tbl_pool', function (Blueprint $table) {
            $table->increments('id');
            $table->string('pool_name', 40);
            $table->string('range_ip', 40);
            $table->string('routers', 40);
        });

        // tbl_language
        Schema::create('tbl_language', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 32);
            $table->string('folder', 32);
            $table->string('author', 60)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_language');
        Schema::dropIfExists('tbl_pool');
        Schema::dropIfExists('tbl_routers');
        Schema::dropIfExists('tbl_bandwidth');
        Schema::dropIfExists('tbl_appconfig');
    }
};
