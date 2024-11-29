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
        Schema::table('banner_images', function (Blueprint $table) {
            $table->enum('section', ['banner', 'content', 'footer'])->default('banner');
            $table->string('url')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banner_images', function (Blueprint $table) {
            $table->dropColumn('section'); // Xóa cột nếu rollback
            $table->dropColumn('url'); // Xóa cột nếu rollback
        });
    }
};
