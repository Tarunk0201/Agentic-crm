import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Utility to decode JWT payload
  const decodeJwt = (token) => {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to decode JWT', e);
      return null;
    }
  };

  useEffect(() => {
    if (!tokens.accessToken && tokens.refreshToken) {
      // Attempt to refresh access token immediately
      refreshAccessToken();
    }
    const storedUser = localStorage.getItem("user");
    if (tokens.accessToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [tokens.accessToken]);

  // Set up interval to refresh token before it expires (e.g., every 14 minutes)
  useEffect(() => {
    if (!tokens.refreshToken) return;
    const refreshInterval = setInterval(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000); // 14 minutes
    return () => clearInterval(refreshInterval);
  }, [tokens.refreshToken]);

  const login = (authData) => {
    const { accessToken, refreshToken, ...userData } = authData;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setTokens({ accessToken, refreshToken });
    setUser(userData);
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${baseUrl}/api/tenant/auth/refresh-token`;
      console.log('Refreshing token with URL:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokens.refreshToken }),
      });
      console.log('Refresh response status:', response.status);
      if (!response.ok) throw new Error('Refresh failed');
      const data = await response.json();
      const newAccessToken = data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      setTokens(prev => ({ ...prev, accessToken: newAccessToken }));
      console.log('Token refreshed successfully');
    } catch (err) {
      console.error('Token refresh error:', err);
      logout(); // Force logout if refresh fails
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setTokens({ accessToken: null, refreshToken: null });
    setUser(null);
    navigate("/login"); // Redirect to login on logout
  };

  const value = {
    user,
    tokens,
    setTokens, // <-- Add this line
    isAuthenticated: !!tokens.accessToken,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
