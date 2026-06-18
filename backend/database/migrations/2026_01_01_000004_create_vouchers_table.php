<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Prepaid vouchers. Legacy source: tbl_voucher.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_voucher', function (Blueprint $table) {
            $table->increments('id');
            $table->enum('type', ['Hotspot', 'PPPOE']);
            $table->string('routers', 32)->nullable();
            $table->integer('id_plan');
            $table->string('code', 55);
            $table->string('batch', 200)->nullable();
            $table->string('user', 45);
            $table->string('status', 25);
            $table->string('generated_by', 200);
            $table->string('generated_for', 100)->nullable();
            $table->tinyInteger('expired')->nullable();
            $table->string('allocation', 200)->nullable()->default('0');
            $table->date('created_date')->nullable();
            $table->string('user_status', 50)->default('activate');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_voucher');
    }
};
