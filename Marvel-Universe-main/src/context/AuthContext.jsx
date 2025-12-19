import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('marvel_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('marvel_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Register new user
  const register = (name, email, password) => {
    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem('marvel_users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, this should be hashed
      createdAt: new Date().toISOString()
    };

    // Save to users array
    users.push(newUser);
    localStorage.setItem('marvel_users', JSON.stringify(users));

    // Auto-login after registration
    const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem('marvel_user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  // Login user
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('marvel_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const userData = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem('marvel_user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('marvel_user');
    setUser(null);
  };

  // Reset password
  const resetPassword = (email, newPassword) => {
    const users = JSON.parse(localStorage.getItem('marvel_users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      throw new Error('Email not found');
    }

    // Update password
    users[userIndex].password = newPassword; // In production, this should be hashed
    localStorage.setItem('marvel_users', JSON.stringify(users));

    return true;
  };

  // Check if email exists (for password reset)
  const checkEmailExists = (email) => {
    const users = JSON.parse(localStorage.getItem('marvel_users') || '[]');
    return users.some(u => u.email === email);
  };

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    resetPassword,
    checkEmailExists,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

