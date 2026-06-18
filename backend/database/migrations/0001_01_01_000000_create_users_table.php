<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('username', 45)->default('')->unique();
            $table->string('fullname', 45)->default('');
            $table->mediumText('password');
            $table->enum('user_type', ['Admin', 'Sales', 'Regular', 'POS'])->nullable();
            $table->string('access_control', 10)->default('0');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->dateTime('last_login')->nullable();
            $table->dateTime('creationdate')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_users');
    }
};
