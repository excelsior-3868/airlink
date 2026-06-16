<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Active subscriptions + billing ledger.
 * Legacy sources: tbl_user_recharges, tbl_transactions.
 * Note: legacy user_recharges.customer_id is a varchar (not a clean FK) -> kept as customer_ref,
 * with a nullable customer_id FK populated when it maps to a real customer.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recharges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_ref', 200)->nullable();    // legacy customer_id (raw)
            $table->string('username', 32);
            $table->foreignId('plan_id')->nullable()->constrained('plans')->nullOnDelete();
            $table->string('plan_name', 40);                    // legacy namebp
            $table->date('recharged_on');
            $table->date('expiration')->nullable();
            $table->time('time');
            $table->string('status', 20);                       // on / off
            $table->string('method', 100)->nullable();
            $table->string('router_name', 32)->nullable();
            $table->string('type', 15);
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();

            $table->index(['status', 'expiration']);            // expiration scheduler scans
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice', 25)->index();
            $table->string('username', 32)->index();
            $table->string('plan_name', 40);
            $table->string('price', 40);
            $table->date('recharged_on');
            $table->date('expiration')->nullable();
            $table->time('time');
            $table->string('method', 100)->nullable();
            $table->string('router_name', 32)->nullable();
            $table->enum('type', ['Hotspot', 'PPPOE']);
            $table->unsignedBigInteger('legacy_id')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('recharges');
    }
};
