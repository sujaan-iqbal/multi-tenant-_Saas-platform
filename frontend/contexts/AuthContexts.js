// frontend/contexts/AuthContext.jsx
'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check localStorage for existing token on mount
    const savedToken = localStorage.getItem('saas_token');
    const savedUser = localStorage.getItem('saas_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password, tenantSlug) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password, tenantSlug }
      );
      
      const { token: newToken, user: userData } = response.data;
      
      // Save to state and localStorage
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('saas_token', newToken);
      localStorage.setItem('saas_user', JSON.stringify(userData));
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (companyName, email, password) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        { companyName, email, password }
      );
      
      const { token: newToken, user: userData, tenant } = response.data;
      
      // Save to state and localStorage
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('saas_token', newToken);
      localStorage.setItem('saas_user', JSON.stringify(userData));
      localStorage.setItem('saas_tenant', JSON.stringify(tenant));
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_tenant');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};