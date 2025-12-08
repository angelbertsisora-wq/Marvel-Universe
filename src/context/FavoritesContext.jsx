import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load favorites from localStorage when user changes
  useEffect(() => {
    if (user) {
      const storedFavorites = localStorage.getItem(`marvel_favorites_${user.id}`);
      if (storedFavorites) {
        try {
          setFavorites(JSON.parse(storedFavorites));
        } catch (error) {
          console.error('Error parsing favorites data:', error);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user && favorites.length >= 0) {
      localStorage.setItem(`marvel_favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Add film to favorites
  const addFavorite = (film) => {
    if (!user) {
      throw new Error('You must be logged in to add favorites');
    }

    const existingFavorite = favorites.find(f => f.id === film.id);
    if (existingFavorite) {
      return; // Already in favorites
    }

    const newFavorite = {
      ...film,
      addedAt: new Date().toISOString(),
      theories: '',
      notes: '',
    };

    setFavorites(prev => [...prev, newFavorite]);
  };

  // Remove film from favorites
  const removeFavorite = (filmId) => {
    setFavorites(prev => prev.filter(f => f.id !== filmId));
  };

  // Check if film is favorited
  const isFavorite = (filmId) => {
    return favorites.some(f => f.id === filmId);
  };

  // Update theories for a favorite film
  const updateTheories = (filmId, theories) => {
    setFavorites(prev =>
      prev.map(f =>
        f.id === filmId ? { ...f, theories } : f
      )
    );
  };

  // Update notes for a favorite film
  const updateNotes = (filmId, notes) => {
    setFavorites(prev =>
      prev.map(f =>
        f.id === filmId ? { ...f, notes } : f
      )
    );
  };

  // Toggle favorite status
  const toggleFavorite = (film) => {
    if (!user) {
      throw new Error('You must be logged in to add favorites');
    }

    if (isFavorite(film.id)) {
      removeFavorite(film.id);
    } else {
      addFavorite(film);
    }
  };

  const value = {
    favorites,
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

