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
        Schema::create('tbl_user_recharges', function (Blueprint $table) {
            $table->increments('id');
            $table->string('customer_id', 200);
            $table->string('username', 32);
            $table->integer('plan_id');
            $table->string('namebp', 40);
            $table->date('recharged_on');
            $table->date('expiration')->nullable();
            $table->time('time');
            $table->string('status', 20);
            $table->string('method', 100)->nullable();
            $table->string('routers', 32);
            $table->string('type', 15);
        });

        Schema::create('tbl_transactions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('invoice', 25);
            $table->string('username', 32);
            $table->string('plan_name', 40);
            $table->string('price', 40);
            $table->date('recharged_on');
            $table->date('expiration')->nullable();
            $table->time('time');
            $table->string('method', 100)->nullable();
            $table->string('routers', 32);
            $table->enum('type', ['Hotspot', 'PPPOE']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_transactions');
        Schema::dropIfExists('tbl_user_recharges');
    }
};
