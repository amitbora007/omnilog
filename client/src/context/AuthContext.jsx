import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token was passed in query parameter from Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('omnilog_token', tokenFromUrl);
      // Clean query parameter from URL without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('omnilog_token');
    // If no token exists, the user is an unauthenticated guest — avoid firing redundant 401 requests
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (err) {
      // Purge invalid/expired token from local storage
      localStorage.removeItem('omnilog_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('omnilog_token');
      setUser(null);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loginWithGoogle,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
