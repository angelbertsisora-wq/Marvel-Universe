import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { props } = usePage();
  const [user, setUser] = useState(props.auth?.user || null);
  const [isLoading, setIsLoading] = useState(false);

  // Clean up old localStorage user data on mount (migrate to Laravel DB)
  useEffect(() => {
    // Remove old localStorage user data - now using MySQL database
    if (typeof window !== 'undefined') {
      localStorage.removeItem('marvel_user');
      localStorage.removeItem('marvel_users');
    }
  }, []);

  // Sync user from Laravel session when props change
  useEffect(() => {
    setUser(props.auth?.user || null);
  }, [props.auth?.user]);

  // Register new user (handled by AuthModal via Inertia, kept for compatibility)
  const register = (name, email, password) => {
    // This is now handled by AuthModal using Inertia
    console.warn('register() called directly - use AuthModal instead');
  };

  // Login user (handled by AuthModal via Inertia, kept for compatibility)
  const login = (email, password) => {
    // This is now handled by AuthModal using Inertia
    console.warn('login() called directly - use AuthModal instead');
  };

  const logout = () => {
    // Logout is handled by Navbar component via Inertia
    // This function is kept for compatibility but should use router.post(route('logout')) from component
  };

  const resetPassword = (email, newPassword) => {
    // Password reset should be handled via Laravel's password reset flow
    console.warn('resetPassword() - use Laravel password reset instead');
  };

  const checkEmailExists = (email) => {
    // This would require a backend check, for now return false
    return false;
  };

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    resetPassword,
    checkEmailExists,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



