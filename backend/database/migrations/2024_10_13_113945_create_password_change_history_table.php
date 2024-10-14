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
        Schema::create('password_change_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->text('token_reset');
            $table->boolean('is_used')->default(false);
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'token_reset']);
            $table->index(['user_id', 'token_reset']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_change_history');
    }
};
