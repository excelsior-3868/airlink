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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('username', 200)->nullable()->unique();
            $table->string('password');                       // legacy crypt() -> bcrypt on first login
            $table->string('fullname', 100)->nullable();
            $table->string('batch', 200)->nullable();
            $table->mediumText('address')->nullable();
            $table->string('phonenumber', 20)->nullable()->default('0');
            $table->integer('validity')->nullable();
            $table->string('validity_unit', 10)->nullable();
            $table->string('profile', 100)->nullable();        // plan/profile name
            $table->string('type', 100)->nullable();           // Hotspot/PPPOE
            $table->string('generated_by', 100)->nullable();
            $table->string('generated_for', 100)->nullable();
            $table->string('status', 50)->default('activate');
            $table->timestamp('last_login_at')->nullable();
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
