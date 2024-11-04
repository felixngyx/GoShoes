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
        Schema::table('cart', function (Blueprint $table) {
            $table->renameColumn('product_id', 'product_variant_id');
            $table->dropForeign('cart_product_id_foreign');
            $table->foreign('product_variant_id')->references('id')->on('product_variants')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart', function (Blueprint $table) {
            $table->renameColumn('product_variant_id', 'product_id');
            $table->dropForeign('cart_product_variant_id_foreign');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
        });
    }
};
