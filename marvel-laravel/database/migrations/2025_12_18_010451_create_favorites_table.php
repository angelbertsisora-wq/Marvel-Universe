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
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->bigInteger('film_id'); // API film ID
            $table->string('film_title');
            $table->text('film_overview')->nullable();
            $table->string('film_poster_url')->nullable();
            $table->date('film_release_date');
            $table->string('film_type')->default('Movie'); // Movie or TV
            $table->text('theories')->nullable(); // User's theories about the film
            $table->text('notes')->nullable(); // User's personal notes
            $table->timestamps();
            
            // Ensure a user can't favorite the same film twice
            $table->unique(['user_id', 'film_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
