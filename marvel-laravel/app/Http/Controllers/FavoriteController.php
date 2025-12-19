<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class FavoriteController extends Controller
{
    /**
     * Display a listing of the user's favorites.
     */
    public function index()
    {
        $favorites = Auth::user()->favorites()->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'favorites' => $favorites->map(function ($favorite) {
                return [
                    'id' => $favorite->id,
                    'film_id' => $favorite->film_id,
                    'title' => $favorite->film_title,
                    'overview' => $favorite->film_overview,
                    'poster_url' => $favorite->film_poster_url,
                    'release_date' => $favorite->film_release_date->format('Y-m-d'),
                    'type' => $favorite->film_type,
                    'theories' => $favorite->theories,
                    'notes' => $favorite->notes,
                    'addedAt' => $favorite->created_at->toISOString(),
                ];
            }),
        ]);
    }

    /**
     * Store a newly created favorite in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'film_id' => 'required|integer',
            'film_title' => 'required|string|max:255',
            'film_overview' => 'nullable|string',
            'film_poster_url' => 'nullable|url',
            'film_release_date' => 'required|date',
            'film_type' => 'nullable|string|max:50',
        ]);

        // Check if already favorited
        $existing = Favorite::where('user_id', Auth::id())
            ->where('film_id', $validated['film_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Film is already in favorites',
                'favorite' => $this->formatFavorite($existing),
            ], 200);
        }

        $favorite = Auth::user()->favorites()->create([
            'film_id' => $validated['film_id'],
            'film_title' => $validated['film_title'],
            'film_overview' => $validated['film_overview'] ?? null,
            'film_poster_url' => $validated['film_poster_url'] ?? null,
            'film_release_date' => $validated['film_release_date'],
            'film_type' => $validated['film_type'] ?? 'Movie',
            'theories' => null,
            'notes' => null,
        ]);

        return response()->json([
            'message' => 'Favorite added successfully',
            'favorite' => $this->formatFavorite($favorite),
        ], 201);
    }

    /**
     * Update the specified favorite (theories/notes).
     */
    public function update(Request $request, Favorite $favorite)
    {
        // Ensure user owns this favorite
        if ($favorite->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'theories' => 'nullable|string|max:5000',
            'notes' => 'nullable|string|max:5000',
        ]);

        $favorite->update($validated);

        return response()->json([
            'message' => 'Favorite updated successfully',
            'favorite' => $this->formatFavorite($favorite->fresh()),
        ]);
    }

    /**
     * Remove the specified favorite from storage.
     */
    public function destroy(Favorite $favorite)
    {
        // Ensure user owns this favorite
        if ($favorite->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Favorite removed successfully',
        ]);
    }

    /**
     * Toggle favorite (add if not exists, remove if exists).
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'film_id' => 'required|integer',
            'film_title' => 'required|string|max:255',
            'film_overview' => 'nullable|string',
            'film_poster_url' => 'nullable|url',
            'film_release_date' => 'required|date',
            'film_type' => 'nullable|string|max:50',
        ]);

        $favorite = Favorite::where('user_id', Auth::id())
            ->where('film_id', $validated['film_id'])
            ->first();

        if ($favorite) {
            // Remove if exists
            $favorite->delete();
            return response()->json([
                'message' => 'Favorite removed',
                'is_favorite' => false,
            ]);
        } else {
            // Add if doesn't exist
            $favorite = Auth::user()->favorites()->create([
                'film_id' => $validated['film_id'],
                'film_title' => $validated['film_title'],
                'film_overview' => $validated['film_overview'] ?? null,
                'film_poster_url' => $validated['film_poster_url'] ?? null,
                'film_release_date' => $validated['film_release_date'],
                'film_type' => $validated['film_type'] ?? 'Movie',
                'theories' => null,
                'notes' => null,
            ]);

            return response()->json([
                'message' => 'Favorite added',
                'is_favorite' => true,
                'favorite' => $this->formatFavorite($favorite),
            ]);
        }
    }

    /**
     * Check if a film is favorited.
     */
    public function check(Request $request)
    {
        $validated = $request->validate([
            'film_id' => 'required|integer',
        ]);

        $isFavorite = Favorite::where('user_id', Auth::id())
            ->where('film_id', $validated['film_id'])
            ->exists();

        return response()->json([
            'is_favorite' => $isFavorite,
        ]);
    }

    /**
     * Format favorite for JSON response.
     */
    private function formatFavorite(Favorite $favorite): array
    {
        return [
            'id' => $favorite->id,
            'film_id' => $favorite->film_id,
            'title' => $favorite->film_title,
            'overview' => $favorite->film_overview,
            'poster_url' => $favorite->film_poster_url,
            'release_date' => $favorite->film_release_date->format('Y-m-d'),
            'type' => $favorite->film_type,
            'theories' => $favorite->theories,
            'notes' => $favorite->notes,
            'addedAt' => $favorite->created_at->toISOString(),
        ];
    }
}
