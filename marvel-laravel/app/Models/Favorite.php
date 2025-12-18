<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    protected $fillable = [
        'user_id',
        'film_id',
        'film_title',
        'film_overview',
        'film_poster_url',
        'film_release_date',
        'film_type',
        'theories',
        'notes',
    ];

    protected $casts = [
        'film_release_date' => 'date',
    ];

    /**
     * Get the user that owns the favorite.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
