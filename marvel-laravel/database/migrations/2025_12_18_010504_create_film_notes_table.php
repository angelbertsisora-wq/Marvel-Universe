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
        Schema::create('film_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->bigInteger('film_id'); // API film ID
            $table->text('note_text'); // The actual note/theory content
            $table->string('note_type')->default('theory'); // 'theory' or 'note'
            $table->timestamps();
            
            // Index for faster queries
            $table->index(['user_id', 'film_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('film_notes');
    }
};
