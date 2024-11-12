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
        Schema::table('banners', function (Blueprint $table) {
            // Xóa cột image
            $table->dropColumn('image');
            $table->dropColumn('position');
            // Thêm các cột mới
            $table->string('title')->after('id');
            $table->boolean('active')->default(true)->after('position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            // Hoàn tác: xóa các cột mới
            $table->dropColumn(['title', 'active']);
            
            // Hoàn tác: thêm lại cột image
            $table->string('image')->after('id');
        });
    }
};
