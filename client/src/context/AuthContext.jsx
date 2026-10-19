import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
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
      setAuthError(null);
    } catch (err) {
      // Purge invalid/expired token from local storage
      localStorage.removeItem('omnilog_token');
      setUser(null);
      if (
        err.message &&
        (err.message.includes('deactivated') ||
          err.message.includes('suspended') ||
          err.message.includes('customer support'))
      ) {
        setAuthError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if token was passed in secure hash fragment (RFC 3986) or query parameter from Google OAuth callback
    let tokenFromUrl = null;
    let errorFromUrl = null;

    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      tokenFromUrl = hashParams.get('token');
      errorFromUrl = hashParams.get('error');
    }

    if (!tokenFromUrl || !errorFromUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      if (!tokenFromUrl) tokenFromUrl = urlParams.get('token');
      if (!errorFromUrl) errorFromUrl = urlParams.get('error');
    }

    if (errorFromUrl) {
      setAuthError(decodeURIComponent(errorFromUrl));
    }

    if (tokenFromUrl) {
      localStorage.setItem('omnilog_token', tokenFromUrl);
    }

    // Immediately clean both query and hash fragments from URL without reloading
    if (tokenFromUrl || errorFromUrl || window.location.hash) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    checkAuth();
  }, [checkAuth]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const loginWithGoogle = useCallback(() => {
    window.location.href = authApi.getGoogleAuthUrl();
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('omnilog_token');
      setUser(null);
      window.location.href = '/';
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      authError,
      clearAuthError,
      loginWithGoogle,
      logout,
      refreshUser: checkAuth,
    }),
    [user, loading, authError, clearAuthError, loginWithGoogle, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
