import React, { createContext, useContext, useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const FavoritesContext = createContext();

// Helper function to get CSRF token from cookie or meta tag
const getCsrfToken = () => {
  // Try to get from cookie (Laravel stores it as XSRF-TOKEN)
  const name = 'XSRF-TOKEN';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  
  // Fallback: try to get from meta tag if available
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const { props } = usePage();
  const { showError, showSuccess, showWarning } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get CSRF token from props or cookie
  const getCsrfTokenFromContext = () => {
    const token = props?.csrf_token || getCsrfToken();
    if (!token) {
      console.warn('CSRF token not found. Check if user is authenticated and session is valid.');
    }
    return token;
  };

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
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Failed to load favorites (${response.status})`;
            console.error('Failed to load favorites:', response.status);
            showError(errorMessage);
            setFavorites([]);
          }
        } catch (error) {
          console.error('Error loading favorites:', error);
          showError('Network error: Unable to load favorites. Please check your connection.');
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
      const csrfToken = getCsrfTokenFromContext();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
        headers['X-CSRF-TOKEN'] = csrfToken; // Also send as X-CSRF-TOKEN for compatibility
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers,
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
        showSuccess(`${data.favorite.title} added to favorites!`);
      } else {
        let errorMessage = 'Failed to add favorite';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          
          // Handle specific error cases
          if (response.status === 419) {
            errorMessage = 'Session expired. Please refresh the page and try again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (response.status === 422) {
            errorMessage = errorData.message || 'Invalid data provided. Please check your input.';
          }
        } catch (e) {
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      // Only show error if it wasn't already shown above
      if (!error.message.includes('Failed to add favorite') && !error.message.includes('Session expired')) {
        showError(error.message || 'Failed to add favorite. Please try again.');
      }
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
          const csrfToken = getCsrfTokenFromContext();
          const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          };
          
          if (csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
          }

          const deleteResponse = await fetch(`/api/favorites/${favoriteToDelete.id}`, {
            method: 'DELETE',
            headers,
            credentials: 'same-origin',
          });

          if (deleteResponse.ok) {
            setFavorites((prev) => prev.filter((f) => f.id !== filmId));
            showSuccess('Favorite removed successfully');
          } else {
            let errorMessage = 'Failed to remove favorite';
            try {
              const errorData = await deleteResponse.json();
              errorMessage = errorData.message || errorMessage;
              
              if (deleteResponse.status === 403) {
                errorMessage = 'You do not have permission to remove this favorite.';
              } else if (deleteResponse.status === 404) {
                errorMessage = 'Favorite not found. It may have already been removed.';
              }
            } catch (e) {
              errorMessage = `Server error (${deleteResponse.status}). Please try again.`;
            }
            showError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      } else {
        const errorData = await allFavoritesResponse.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to fetch favorites';
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Only show error if it wasn't already shown above
      if (!error.message.includes('Failed to remove favorite') && !error.message.includes('Failed to fetch')) {
        showError(error.message || 'Failed to remove favorite. Please try again.');
      }
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

      if (!allFavoritesResponse.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const allData = await allFavoritesResponse.json();
      const favoriteToUpdate = allData.favorites.find((f) => f.film_id === filmId);
      
      if (!favoriteToUpdate) {
        throw new Error('Favorite not found');
      }

      if (!favoriteToUpdate.id) {
        throw new Error('Favorite database ID is missing');
      }

      const csrfToken = getCsrfTokenFromContext();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
        headers['X-CSRF-TOKEN'] = csrfToken; // Also send as X-CSRF-TOKEN for compatibility
      } else {
        console.warn('CSRF token not found for theories update');
      }

      console.log('Updating theories for favorite:', {
        filmId,
        dbId: favoriteToUpdate.id,
        theoriesLength: theories.length,
      });

      const response = await fetch(`/api/favorites/${favoriteToUpdate.id}`, {
        method: 'PUT',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ theories }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update theories';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          if (response.status === 403) {
            errorMessage = 'You do not have permission to update this favorite.';
          } else if (response.status === 404) {
            errorMessage = 'Favorite not found. It may have been removed.';
          } else if (response.status === 422) {
            errorMessage = errorData.message || 'Invalid data. Please check your input.';
          } else if (response.status === 419) {
            errorMessage = 'Session expired. Please refresh the page and try again.';
          }
          
          console.error('Update theories error response:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          });
        } catch (e) {
          const text = await response.text();
          console.error('Update theories error (non-JSON):', {
            status: response.status,
            statusText: response.statusText,
            body: text,
          });
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFavorites((prev) =>
        prev.map((f) => (f.id === filmId ? { ...f, theories: data.favorite.theories } : f)),
      );
      showSuccess('Theories updated successfully!');
    } catch (error) {
      console.error('Error updating theories:', error);
      // Only show error if it wasn't already shown above
      if (!error.message.includes('Failed to update theories') && !error.message.includes('Session expired')) {
        showError(error.message || 'Failed to update theories. Please try again.');
      }
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

      if (!allFavoritesResponse.ok) {
        const errorData = await allFavoritesResponse.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to fetch favorites';
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      const allData = await allFavoritesResponse.json();
      const favoriteToUpdate = allData.favorites.find((f) => f.film_id === filmId);
      
      if (!favoriteToUpdate) {
        const errorMessage = 'Favorite not found';
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!favoriteToUpdate.id) {
        const errorMessage = 'Favorite database ID is missing';
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      const csrfToken = getCsrfTokenFromContext();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
        headers['X-CSRF-TOKEN'] = csrfToken; // Also send as X-CSRF-TOKEN for compatibility
      } else {
        console.warn('CSRF token not found for notes update');
      }

      console.log('Updating notes for favorite:', {
        filmId,
        dbId: favoriteToUpdate.id,
        notesLength: notes.length,
      });

      const response = await fetch(`/api/favorites/${favoriteToUpdate.id}`, {
        method: 'PUT',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update notes';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          if (response.status === 403) {
            errorMessage = 'You do not have permission to update this favorite.';
          } else if (response.status === 404) {
            errorMessage = 'Favorite not found. It may have been removed.';
          } else if (response.status === 422) {
            errorMessage = errorData.message || 'Invalid data. Please check your input.';
          } else if (response.status === 419) {
            errorMessage = 'Session expired. Please refresh the page and try again.';
          }
          
          console.error('Update notes error response:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          });
        } catch (e) {
          const text = await response.text();
          console.error('Update notes error (non-JSON):', {
            status: response.status,
            statusText: response.statusText,
            body: text,
          });
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFavorites((prev) =>
        prev.map((f) => (f.id === filmId ? { ...f, notes: data.favorite.notes } : f)),
      );
      showSuccess('Notes updated successfully!');
    } catch (error) {
      console.error('Error updating notes:', error);
      // Only show error if it wasn't already shown above
      if (!error.message.includes('Failed to update notes') && !error.message.includes('Session expired')) {
        showError(error.message || 'Failed to update notes. Please try again.');
      }
      throw error;
    }
  };

  const toggleFavorite = async (film) => {
    if (!user) {
      throw new Error('You must be logged in to add favorites');
    }

    try {
      const csrfToken = getCsrfTokenFromContext();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      
      // Laravel accepts both X-CSRF-TOKEN and X-XSRF-TOKEN headers
      // Use X-XSRF-TOKEN for cookie-based tokens (standard Laravel approach)
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
        headers['X-CSRF-TOKEN'] = csrfToken; // Also send as X-CSRF-TOKEN for compatibility
      }

      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers,
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
          showSuccess(`${data.favorite.title} added to favorites!`);
        } else {
          // Removed
          setFavorites((prev) => prev.filter((f) => f.id !== film.id));
          showSuccess('Removed from favorites');
        }
      } else {
        // Get detailed error message from response
        let errorMessage = 'Failed to toggle favorite';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          // Handle specific error cases
          if (response.status === 419 || errorData.message?.includes('CSRF')) {
            errorMessage = 'Session expired. Please refresh the page and try again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (response.status === 422) {
            errorMessage = errorData.message || 'Invalid data provided. Please check your input.';
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        
        console.error('Toggle favorite error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
        });
        
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Only show error if it wasn't already shown above
      if (!error.message.includes('Failed to toggle favorite') && !error.message.includes('Session expired')) {
        showError(error.message || 'Failed to update favorite. Please try again.');
      }
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



