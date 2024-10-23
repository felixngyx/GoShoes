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
        Schema::table('order_payments', function (Blueprint $table) {
           // Xóa khóa chính hiện tại
           $table->dropPrimary();

           // Thêm cột id với auto-increment và đặt nó làm khóa chính
           $table->bigIncrements('id')->first();

           // Đặt lại khóa ngoại cho order_id và method_id
           $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
           $table->foreign('method_id')->references('id')->on('payment_methods')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_payments', function (Blueprint $table) {
          
        });
    }
};
