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
        Schema::table('variant_colors', function (Blueprint $table) {
            $table->renameColumn('hex_code', 'link_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('variant_colors', function (Blueprint $table) {
            $table->renameColumn('link_image', 'hex_code');
        });
    }
};
