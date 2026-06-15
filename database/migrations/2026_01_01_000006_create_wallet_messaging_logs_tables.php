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
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->string('username', 200);
            $table->string('user_type', 200)->nullable();
            $table->integer('credit_limit')->nullable();
            $table->integer('credit_balance')->default(0);
            $table->integer('available_balance')->nullable();
            $table->date('last_loaded_date')->nullable();
            $table->string('loaded_by', 200)->nullable();
            $table->string('last_collected_by', 50)->nullable();
            $table->string('last_registered_by', 50)->nullable();
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('company_wallet', function (Blueprint $table) {
            $table->id();
            $table->integer('account_balance')->nullable();
            $table->integer('balance_to_collect')->nullable();
            $table->date('last_loaded_date')->nullable();
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('from_user', 32);
            $table->string('to_user', 32);
            $table->string('title', 60);
            $table->mediumText('message');
            $table->boolean('is_read')->default(false);     // legacy status enum '0'/'1'
            $table->dateTime('sent_at');
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->dateTime('logged_at')->nullable();
            $table->string('type', 50)->nullable();
            $table->mediumText('description')->nullable();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('username', 200)->nullable();
            $table->string('ip', 100)->nullable();
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('ip_bindings', function (Blueprint $table) {
            $table->id();
            $table->string('mac_address', 100);
            $table->string('address', 100);
            $table->string('nas', 100);
            $table->string('consumer_name', 100);
            $table->string('registered_by', 100);
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ip_bindings');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('company_wallet');
        Schema::dropIfExists('wallets');
    }
};
