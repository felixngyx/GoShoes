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
        Schema::table("banners", function (Blueprint $table) {
            if (Schema::hasColumn('banners', 'start_date')) {
                $table->dropColumn('start_date');
            }
            if (Schema::hasColumn('banners', 'end_date')) {
                $table->dropColumn('end_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("banners", function (Blueprint $table) {
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
        });
    }
};
