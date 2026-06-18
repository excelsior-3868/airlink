<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * End-user / subscriber accounts. Legacy source: tbl_customers.
 * Customers log in by username on the customer portal (separate guard from staff users).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_customers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('username', 200)->nullable();
            $table->string('password', 255);
            $table->string('fullname', 45)->nullable();
            $table->string('batch', 200)->nullable();
            $table->mediumText('address')->nullable();
            $table->string('phonenumber', 20)->nullable()->default('0');
            $table->timestamp('created_at')->useCurrent();
            $table->integer('validity')->nullable();
            $table->string('validity_unit', 10)->nullable();
            $table->dateTime('last_login')->nullable();
            $table->string('profile', 100)->nullable();
            $table->string('type', 100)->nullable();
            $table->string('generated_by', 100)->nullable();
            $table->string('generated_for', 100)->nullable();
            $table->string('status', 50)->default('activate');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_customers');
    }
};
