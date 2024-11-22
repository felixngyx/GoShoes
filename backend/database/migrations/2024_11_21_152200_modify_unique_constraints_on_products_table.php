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
        Schema::table('products', function (Blueprint $table) {
            // Gỡ bỏ unique constraint trên cột slug
            $table->dropUnique(['slug']);

            // Thêm unique constraint cho cột name
            $table->unique('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Thêm lại unique constraint cho cột slug
            $table->unique('slug');

            // Gỡ bỏ unique constraint trên cột name
            $table->dropUnique(['name']);
        });
    }
};
