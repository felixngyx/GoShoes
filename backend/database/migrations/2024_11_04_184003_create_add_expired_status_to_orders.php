<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Thêm trạng thái 'expired' vào ENUM của cột status
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'canceled', 'expired') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE order_payments MODIFY COLUMN status ENUM('pending', 'paid', 'canceled', 'expired') NOT NULL DEFAULT 'pending'");
    }

    public function down()
    {
        // Rollback các thay đổi
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'canceled') NOT NULL DEFAULT 'pending'");
        DB::statement("ALTER TABLE order_payments MODIFY COLUMN status ENUM('pending', 'paid', 'canceled') NOT NULL DEFAULT 'pending'");
    }
};
