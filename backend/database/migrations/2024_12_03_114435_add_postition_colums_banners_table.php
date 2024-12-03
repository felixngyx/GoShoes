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
            $table->string("image")->nullable();
            $table->string("url")->nullable();
            $table->enum("position", ["home1","home2","home3","home4","home5","all1"]);
        });
        Schema::drop("banner_images");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // When you rollback the migration, the table will be created again
        Schema::table("banners", function (Blueprint $table) {
            $table->dropColumn("image");
            $table->dropColumn("url");
            $table->dropColumn("position");
        });
        Schema::create("banner_images", function (Blueprint $table) {
            $table->id();
            $table->string("image");
            $table->enum("section", ["banner", "content", "footer"]);
            $table->timestamps();
        });
    }
};
