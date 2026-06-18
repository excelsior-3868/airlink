<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Seller/POS wallet ledger, internal messaging, activity logs, IP bindings.
 * Legacy sources: wallet, walletCompany, tbl_message, tbl_logs, tbl_ip_binding.
 */
return new class extends Migration
{
    public function up(): void
    {
        // wallet
        Schema::create('wallet', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('credit_limit')->nullable();
            $table->integer('credit_balance');
            $table->integer('available_balance')->nullable();
            $table->string('username', 200);
            $table->date('last_loaded_date')->nullable();
            $table->string('loaded_by', 200)->nullable();
            $table->string('last_collected_by', 50)->nullable();
            $table->string('last_registered_by', 50)->nullable();
            $table->string('user_type', 200)->nullable();
        });

        // walletCompany
        Schema::create('walletCompany', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('account_balance')->nullable();
            $table->integer('balance_to_collect')->nullable();
            $table->date('last_loaded_date')->nullable();
        });

        // tbl_message
        Schema::create('tbl_message', function (Blueprint $table) {
            $table->increments('id');
            $table->string('from_user', 32);
            $table->string('to_user', 32);
            $table->string('title', 60);
            $table->mediumText('message');
            $table->enum('status', ['0', '1'])->default('0');
            $table->dateTime('date');
        });

        // tbl_logs
        Schema::create('tbl_logs', function (Blueprint $table) {
            $table->increments('id');
            $table->dateTime('date')->nullable();
            $table->string('type', 50)->nullable();
            $table->mediumText('description')->nullable();
            $table->integer('userid')->nullable();
            $table->mediumText('ip')->nullable();
            $table->string('username', 200)->nullable();
        });

        // tbl_ip_binding
        Schema::create('tbl_ip_binding', function (Blueprint $table) {
            $table->increments('id');
            $table->string('mac_address', 100);
            $table->string('address', 100);
            $table->string('nas', 100);
            $table->string('consumer_name', 100);
            $table->string('registered_by', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_ip_binding');
        Schema::dropIfExists('tbl_logs');
        Schema::dropIfExists('tbl_message');
        Schema::dropIfExists('walletCompany');
        Schema::dropIfExists('wallet');
    }
};
