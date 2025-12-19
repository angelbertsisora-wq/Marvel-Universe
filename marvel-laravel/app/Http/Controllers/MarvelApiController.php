<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MarvelApiController extends Controller
{
    private const API_URL = 'https://www.whenisthenextmcufilm.com/api';
    private const CACHE_KEY = 'marvel_upcoming_films';
    private const CACHE_DURATION = 3600; // 1 hour in seconds

    /**
     * Fetch upcoming films data from API with caching.
     */
    public function getUpcomingFilms()
    {
        try {
            // Try to get from cache first
            $cachedData = Cache::get(self::CACHE_KEY);
            
            if ($cachedData) {
                Log::info('Marvel API: Returning cached data');
                return response()->json($cachedData);
            }

            // Fetch from API
            Log::info('Marvel API: Fetching fresh data from API', ['url' => self::API_URL]);
            
            try {
                $response = Http::timeout(15)
                    ->retry(3, 100) // Retry 3 times with 100ms delay
                    ->withoutVerifying() // Disable SSL verification for local development (fixes cURL error 60)
                    ->get(self::API_URL);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error('Marvel API: Connection exception', [
                    'message' => $e->getMessage(),
                ]);
                return response()->json([
                    'error' => 'Connection failed',
                    'message' => 'Unable to connect to the API. Please check your internet connection.',
                ], 503);
            } catch (\Exception $e) {
                Log::error('Marvel API: Exception during request', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                return response()->json([
                    'error' => 'Request failed',
                    'message' => 'An error occurred while fetching data: ' . $e->getMessage(),
                ], 500);
            }

            if (!$response->successful()) {
                Log::error('Marvel API: Request failed', [
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 500),
                ]);
                
                return response()->json([
                    'error' => 'Failed to fetch films data',
                    'message' => 'API request failed with status ' . $response->status(),
                ], $response->status());
            }

            $data = $response->json();

            // Validate response structure
            if (!$this->validateApiResponse($data)) {
                Log::error('Marvel API: Invalid response structure', ['data' => $data]);
                return response()->json([
                    'error' => 'Invalid API response',
                    'message' => 'Received invalid data structure from API',
                ], 500);
            }

            // Enrich with video URLs (if needed)
            $enrichedData = $this->enrichWithVideoUrls($data);

            // Cache the data
            Cache::put(self::CACHE_KEY, $enrichedData, self::CACHE_DURATION);
            Log::info('Marvel API: Data cached successfully');

            return response()->json($enrichedData);
        } catch (\Exception $e) {
            Log::error('Marvel API: Exception occurred', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => 'An error occurred while fetching films data',
            ], 500);
        }
    }

    /**
     * Get upcoming films for home page (returns Inertia response).
     */
    public function getUpcomingFilmsForHome()
    {
        try {
            // Try to get from cache first
            $cachedData = Cache::get(self::CACHE_KEY);
            
            if ($cachedData) {
                Log::info('Marvel API: Returning cached data for home page');
                return \Inertia\Inertia::render('MarvelHome', [
                    'upcomingFilms' => $cachedData,
                ]);
            }

            // Fetch from API
            Log::info('Marvel API: Fetching fresh data from API for home page', ['url' => self::API_URL]);
            
            try {
                $response = Http::timeout(15)
                    ->retry(3, 100) // Retry 3 times with 100ms delay
                    ->withoutVerifying() // Disable SSL verification for local development (fixes cURL error 60)
                    ->get(self::API_URL);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error('Marvel API: Connection exception in getUpcomingFilmsForHome', [
                    'message' => $e->getMessage(),
                ]);
                // Return home page with null data, let frontend handle fallback
                return \Inertia\Inertia::render('MarvelHome', [
                    'upcomingFilms' => null,
                ]);
            } catch (\Exception $e) {
                Log::error('Marvel API: Exception in getUpcomingFilmsForHome', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                // Return home page with null data, let frontend handle fallback
                return \Inertia\Inertia::render('MarvelHome', [
                    'upcomingFilms' => null,
                ]);
            }

            if (!$response->successful()) {
                Log::error('Marvel API: Request failed in getUpcomingFilmsForHome', [
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 500),
                ]);
                
                // Return home page with null data, let frontend handle fallback
                return \Inertia\Inertia::render('MarvelHome', [
                    'upcomingFilms' => null,
                ]);
            }

            $data = $response->json();

            // Validate response structure
            if (!$this->validateApiResponse($data)) {
                Log::error('Marvel API: Invalid response structure', ['data' => $data]);
                return \Inertia\Inertia::render('MarvelHome', [
                    'upcomingFilms' => null,
                ]);
            }

            // Enrich with video URLs (if needed)
            $enrichedData = $this->enrichWithVideoUrls($data);

            // Cache the data
            Cache::put(self::CACHE_KEY, $enrichedData, self::CACHE_DURATION);
            Log::info('Marvel API: Data cached successfully for home page');

            return \Inertia\Inertia::render('MarvelHome', [
                'upcomingFilms' => $enrichedData,
            ]);
        } catch (\Exception $e) {
            Log::error('Marvel API: Exception occurred in getUpcomingFilmsForHome', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return home page with null data on error
            return \Inertia\Inertia::render('MarvelHome', [
                'upcomingFilms' => null,
            ]);
        }
    }

    /**
     * Clear the API cache (useful for testing or manual refresh).
     */
    public function clearCache()
    {
        Cache::forget(self::CACHE_KEY);
        
        return response()->json([
            'message' => 'Cache cleared successfully',
        ]);
    }

    /**
     * Validate API response structure.
     */
    private function validateApiResponse($data): bool
    {
        if (!is_array($data)) {
            return false;
        }

        // Check required fields for main film
        if (!isset($data['id']) || !isset($data['title']) || !isset($data['release_date'])) {
            return false;
        }

        // Validate release_date format
        try {
            $date = new \DateTime($data['release_date']);
        } catch (\Exception $e) {
            return false;
        }

        return true;
    }

    /**
     * Enrich API data with video URLs from mapping.
     */
    private function enrichWithVideoUrls($data): array
    {
        // Video URL mapping (same as frontend)
        $filmVideoUrls = [
            969681 => "https://res.cloudinary.com/djef7fggp/video/upload/v1765630197/SPIDER-MAN__BRAND_NEW_DAY_1080p_eiys40.mp4",
            // Add more mappings as needed
        ];

        $enriched = $data;
        $enriched['video_url'] = $filmVideoUrls[$data['id']] ?? null;

        if (isset($data['following_production']) && is_array($data['following_production'])) {
            $enriched['following_production']['video_url'] = $filmVideoUrls[$data['following_production']['id']] ?? null;
        }

        return $enriched;
    }
}
