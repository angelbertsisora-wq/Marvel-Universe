<?php

namespace App\Http\Controllers;

use App\Models\FilmNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FilmNoteController extends Controller
{
    /**
     * Display notes for a specific film.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'film_id' => 'required|integer',
        ]);

        $notes = FilmNote::where('user_id', Auth::id())
            ->where('film_id', $validated['film_id'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'notes' => $notes->map(function ($note) {
                return [
                    'id' => $note->id,
                    'film_id' => $note->film_id,
                    'note_text' => $note->note_text,
                    'note_type' => $note->note_type,
                    'created_at' => $note->created_at->toISOString(),
                    'updated_at' => $note->updated_at->toISOString(),
                ];
            }),
        ]);
    }

    /**
     * Store a newly created note.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'film_id' => 'required|integer',
            'note_text' => 'required|string|max:5000',
            'note_type' => 'required|string|in:theory,note',
        ]);

        $note = Auth::user()->filmNotes()->create($validated);

        return response()->json([
            'message' => 'Note created successfully',
            'note' => [
                'id' => $note->id,
                'film_id' => $note->film_id,
                'note_text' => $note->note_text,
                'note_type' => $note->note_type,
                'created_at' => $note->created_at->toISOString(),
                'updated_at' => $note->updated_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Update the specified note.
     */
    public function update(Request $request, FilmNote $filmNote)
    {
        // Ensure user owns this note
        if ($filmNote->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'note_text' => 'required|string|max:5000',
        ]);

        $filmNote->update($validated);

        return response()->json([
            'message' => 'Note updated successfully',
            'note' => [
                'id' => $filmNote->id,
                'film_id' => $filmNote->film_id,
                'note_text' => $filmNote->note_text,
                'note_type' => $filmNote->note_type,
                'created_at' => $filmNote->created_at->toISOString(),
                'updated_at' => $filmNote->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * Remove the specified note from storage.
     */
    public function destroy(FilmNote $filmNote)
    {
        // Ensure user owns this note
        if ($filmNote->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filmNote->delete();

        return response()->json([
            'message' => 'Note deleted successfully',
        ]);
    }
}
