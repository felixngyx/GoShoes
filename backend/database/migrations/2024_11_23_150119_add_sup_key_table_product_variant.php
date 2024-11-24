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
        Schema::table('product_variants', function (Blueprint $table) {
            $table->index(["product_id", "color_id", "size_id"]);
            $table->unique(["product_id", "color_id", "size_id"]);
            $table->index(["product_id", "color_id"]);
            $table->foreign(["product_id", "color_id"])->references(["product_id", "color_id"])->on("image_variants")->onDelete("cascade");
            $table->string("sku", 191)->unique()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex(["product_id", "color_id", "size_id"]);
            $table->dropUnique(["product_id", "color_id", "size_id"]);
            $table->dropIndex(["product_id", "color_id"]);
            $table->dropPrimary(["product_id", "color_id"]);
            $table->dropForeign(["product_id", "color_id"]);
            $table->dropColumn("sku");
        });
    }
};
