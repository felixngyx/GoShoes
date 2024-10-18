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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->bigInteger('stock_quantity');
            $table->decimal('promotional_price', 10, 2)->nullable();
            $table->enum('status', ['public', 'unpublic', 'hidden'])->default('public');
            $table->string('sku')->unique();
            $table->boolean('is_deleted')->default(false);
            $table->decimal('rating_count', 3, 2)->default(3.00);
            $table->string('slug')->unique();
            $table->string('thumbnail')->nullable();
            $table->string('hagtag');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
        
    }
};
