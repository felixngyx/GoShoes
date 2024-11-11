<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Thay đổi enum để thêm 'refunded'
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded','expired')");

        // Thêm cho bảng order_payments nếu cần
        DB::statement("ALTER TABLE order_payments MODIFY COLUMN status ENUM('pending', 'processing', 'success', 'failed', 'refunded','expired')");
    }

    public function down()
    {
        // Rollback về enum cũ
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'cancelled','expired')");

        // Rollback cho bảng order_payments
        DB::statement("ALTER TABLE order_payments MODIFY COLUMN status ENUM('pending', 'processing', 'success', 'failed','expired')");
    }
};
