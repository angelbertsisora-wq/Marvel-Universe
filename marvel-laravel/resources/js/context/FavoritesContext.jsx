import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites from backend when user changes
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/favorites', {
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
          });

          if (response.ok) {
            const data = await response.json();
            // Transform backend format to frontend format
            const transformedFavorites = data.favorites.map((fav) => ({
              id: fav.film_id,
              title: fav.title,
              overview: fav.overview,
              poster_url: fav.poster_url,
              release_date: fav.release_date,
              type: fav.type,
              theories: fav.theories || '',
              notes: fav.notes || '',
              addedAt: fav.addedAt,
            }));
            setFavorites(transformedFavorites);
          } else {
            console.error('Failed to load favorites:', response.status);
            setFavorites([]);
          }
        } catch (error) {
          console.error('Error loading favorites:', error);
          setFavorites([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFavorites([]);
      }
    };

    loadFavorites();
  }, [user]);

  // Validate film data before adding to favorites
  const validateFilmData = (film) => {
    if (!film || typeof film !== 'object') {
      throw new Error('Invalid film data: film must be an object');
    }
    
    if (!film.id || typeof film.id !== 'number') {
      throw new Error('Invalid film data: film.id is required and must be a number');
    }
    
    if (!film.title || typeof film.title !== 'string' || film.title.trim().length === 0) {
      throw new Error('Invalid film data: film.title is required and must be a non-empty string');
    }
    
    if (!film.release_date || typeof film.release_date !== 'string') {
      throw new Error('Invalid film data: film.release_date is required and must be a string');
    }
    
    // Validate date format
    if (isNaN(new Date(film.release_date).getTime())) {
      throw new Error('Invalid film data: film.release_date is not a valid date');
    }
    
    return true;
  };

  const addFavorite = async (film) => {
    if (!user) {
      throw new Error('You must be logged in to add favorites');
    }

    try {
      validateFilmData(film);
    } catch (error) {
      console.error('Error validating film data:', error);
      throw error;
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          film_id: film.id,
          film_title: film.title,
          film_overview: film.overview || null,
          film_poster_url: film.poster_url || null,
          film_release_date: film.release_date,
          film_type: film.type || 'Movie',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newFavorite = {
          id: data.favorite.film_id,
          title: data.favorite.title,
          overview: data.favorite.overview,
          poster_url: data.favorite.poster_url,
          release_date: data.favorite.release_date,
          type: data.favorite.type,
          theories: data.favorite.theories || '',
          notes: data.favorite.notes || '',
          addedAt: data.favorite.addedAt,
        };
        setFavorites((prev) => [...prev, newFavorite]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add favorite');
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  };

  const removeFavorite = async (filmId) => {
    if (!user) {
      throw new Error('You must be logged in to remove favorites');
    }

    try {
      // Get all favorites to find the database ID
      const allFavoritesResponse = await fetch('/api/favorites', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (allFavoritesResponse.ok) {
        const allData = await allFavoritesResponse.json();
        const favoriteToDelete = allData.favorites.find((f) => f.film_id === filmId);
        
        if (favoriteToDelete) {
          const deleteResponse = await fetch(`/api/favorites/${favoriteToDelete.id}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
          });

          if (deleteResponse.ok) {
            setFavorites((prev) => prev.filter((f) => f.id !== filmId));
          } else {
            throw new Error('Failed to delete favorite');
          }
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  };

  const isFavorite = (filmId) => favorites.some((f) => f.id === filmId);

  const updateTheories = async (filmId, theories) => {
    if (!user) {
      throw new Error('You must be logged in to update theories');
    }

    try {
      const allFavoritesResponse = await fetch('/api/favorites', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (allFavoritesResponse.ok) {
        const allData = await allFavoritesResponse.json();
        const favoriteToUpdate = allData.favorites.find((f) => f.film_id === filmId);
        
        if (favoriteToUpdate) {
          const response = await fetch(`/api/favorites/${favoriteToUpdate.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ theories }),
          });

          if (response.ok) {
            const data = await response.json();
            setFavorites((prev) =>
              prev.map((f) => (f.id === filmId ? { ...f, theories: data.favorite.theories } : f)),
            );
          } else {
            throw new Error('Failed to update theories');
          }
        }
      }
    } catch (error) {
      console.error('Error updating theories:', error);
      throw error;
    }
  };

  const updateNotes = async (filmId, notes) => {
    if (!user) {
      throw new Error('You must be logged in to update notes');
    }

    try {
      const allFavoritesResponse = await fetch('/api/favorites', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (allFavoritesResponse.ok) {
        const allData = await allFavoritesResponse.json();
        const favoriteToUpdate = allData.favorites.find((f) => f.film_id === filmId);
        
        if (favoriteToUpdate) {
          const response = await fetch(`/api/favorites/${favoriteToUpdate.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ notes }),
          });

          if (response.ok) {
            const data = await response.json();
            setFavorites((prev) =>
              prev.map((f) => (f.id === filmId ? { ...f, notes: data.favorite.notes } : f)),
            );
          } else {
            throw new Error('Failed to update notes');
          }
        }
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  };

  const toggleFavorite = async (film) => {
    if (!user) {
      throw new Error('You must be logged in to add favorites');
    }

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          film_id: film.id,
          film_title: film.title,
          film_overview: film.overview || null,
          film_poster_url: film.poster_url || null,
          film_release_date: film.release_date,
          film_type: film.type || 'Movie',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.is_favorite) {
          // Added
          const newFavorite = {
            id: data.favorite.film_id,
            title: data.favorite.title,
            overview: data.favorite.overview,
            poster_url: data.favorite.poster_url,
            release_date: data.favorite.release_date,
            type: data.favorite.type,
            theories: data.favorite.theories || '',
            notes: data.favorite.notes || '',
            addedAt: data.favorite.addedAt,
          };
          setFavorites((prev) => [...prev, newFavorite]);
        } else {
          // Removed
          setFavorites((prev) => prev.filter((f) => f.id !== film.id));
        }
      } else {
        throw new Error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const value = {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    updateTheories,
    updateNotes,
    favoritesCount: favorites.length,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};



