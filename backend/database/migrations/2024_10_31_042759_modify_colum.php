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
    public function up(): void
    {
        // 1. Đầu tiên sửa các giá trị cũ (nếu có) để phù hợp với ENUM mới
        DB::table('order_payments')
            ->where('status', 'success')
            ->update(['status' => 'paid']);

        // 2. Sửa đổi ENUM
        DB::statement("ALTER TABLE order_payments MODIFY COLUMN status ENUM('pending', 'paid', 'refunded', 'failed', 'canceled') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Đầu tiên cập nhật lại các giá trị để phù hợp với ENUM cũ
        DB::table('order_payments')
            ->where('status', 'paid')
            ->update(['status' => 'success']);

        // 2. Khôi phục lại ENUM cũ
        DB::statement("ALTER TABLE order_payments MODIFY COLUMN status ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending'");
    }
};
