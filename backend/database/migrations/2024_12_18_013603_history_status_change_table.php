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
        Schema::create("history_status_change", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table->integer("user_id")->foreign("user_id")->references("id")->on("users");
            $table->integer("order_id")->foreign("order_id")->references("id")->on("orders");
            $table->dateTime("time")->nullable();
            $table->string("status_before");
            $table->string("status_after");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("history_status_change");
    }
};
