<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Service plans. Legacy source: tbl_plans.
 * id_bw -> bandwidth_id FK; legacy `routers` (a router name string) -> router_name.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_plans', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name_plan', 40);
            $table->integer('id_bw');
            $table->integer('price')->nullable();
            $table->enum('type', ['Hotspot', 'PPPOE']);
            $table->enum('typebp', ['Unlimited', 'Limited'])->nullable();
            $table->enum('limit_type', ['Time_Limit', 'Data_Limit', 'Both_Limit'])->nullable();
            $table->unsignedInteger('time_limit')->nullable();
            $table->enum('time_unit', ['Mins', 'Hrs'])->nullable();
            $table->unsignedInteger('data_limit')->nullable();
            $table->enum('data_unit', ['MB', 'GB'])->nullable();
            $table->integer('validity');
            $table->string('validity_unit', 20)->nullable();
            $table->integer('shared_users')->nullable();
            $table->string('routers', 32)->default('0');
            $table->string('pool', 40)->nullable();
            $table->integer('access_control')->default(0);
            $table->integer('data_usage_gb')->default(0);
            $table->integer('daily_quota')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_plans');
    }
};
