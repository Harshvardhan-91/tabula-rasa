// client/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (isTokenValid(storedToken)) {
          setCurrentUser(parsedUser);
        } else {
          logout();
        }
      } catch (parseError) {
        console.error('Error parsing stored user:', parseError);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const isTokenValid = (token) => {
    return token && token.length > 0;
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      console.log('Login request data:', { email, password });
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/auth/login`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('Login failed:', data);
        setError(data.message || 'Login failed');
        throw new Error(data.message || 'Login failed');
      }
      
      setCurrentUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to fetch');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    setError(null);
    setLoading(true);
    try {
      console.log('Signup request data:', { email, password, name });
      console.log('API URL:', `${import.meta.env.VITE_API_URL}/auth/signup`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('Signup failed:', data);
        setError(data.message || 'Signup failed');
        throw new Error(data.message || 'Signup failed');
      }
      
      setCurrentUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to fetch');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};