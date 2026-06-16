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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['Hotspot', 'PPPOE']);
            $table->string('router_name', 32)->nullable();
            $table->foreignId('plan_id')->nullable()->constrained('plans')->nullOnDelete();
            $table->string('code', 55)->index();
            $table->string('batch', 200)->nullable();
            $table->string('user', 45)->nullable();
            $table->string('status', 25)->default('0');
            $table->string('generated_by', 200)->nullable();
            $table->string('generated_for', 100)->nullable();
            $table->boolean('expired')->nullable();
            $table->string('allocation', 200)->nullable()->default('0');
            $table->date('issued_on')->nullable();              // legacy created_date
            $table->string('user_status', 50)->default('activate');
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
