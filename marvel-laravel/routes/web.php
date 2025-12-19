<?php

use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\FilmNoteController;
use App\Http\Controllers\MarvelApiController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [MarvelApiController::class, 'getUpcomingFilmsForHome'])->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Marvel API routes (public, but cached)
Route::get('/api/marvel/upcoming-films', [MarvelApiController::class, 'getUpcomingFilms'])->name('api.marvel.upcoming-films');
Route::post('/api/marvel/clear-cache', [MarvelApiController::class, 'clearCache'])->middleware('auth')->name('api.marvel.clear-cache');

// Favorites routes (protected)
Route::middleware('auth')->prefix('api/favorites')->name('api.favorites.')->group(function () {
    Route::get('/', [FavoriteController::class, 'index'])->name('index');
    Route::post('/', [FavoriteController::class, 'store'])->name('store');
    Route::post('/toggle', [FavoriteController::class, 'toggle'])->name('toggle');
    Route::post('/check', [FavoriteController::class, 'check'])->name('check');
    Route::put('/{favorite}', [FavoriteController::class, 'update'])->name('update');
    Route::delete('/{favorite}', [FavoriteController::class, 'destroy'])->name('destroy');
});

// Film Notes routes (protected)
Route::middleware('auth')->prefix('api/film-notes')->name('api.film-notes.')->group(function () {
    Route::get('/', [FilmNoteController::class, 'index'])->name('index');
    Route::post('/', [FilmNoteController::class, 'store'])->name('store');
    Route::put('/{filmNote}', [FilmNoteController::class, 'update'])->name('update');
    Route::delete('/{filmNote}', [FilmNoteController::class, 'destroy'])->name('destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
