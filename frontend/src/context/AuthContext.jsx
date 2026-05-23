import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API_BASE = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure Axios default headers
  useEffect(() => {
    const storedToken = localStorage.getItem('sw_token');
    const storedUser = localStorage.getItem('sw_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token: receivedToken, user: receivedUser } = response.data.data;
      
      localStorage.setItem('sw_token', receivedToken);
      localStorage.setItem('sw_user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      
      return receivedUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal. Silakan coba lagi.';
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/profile`);
      const updatedUser = response.data.data.user;
      
      localStorage.setItem('sw_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Gagal mengambil profil:', error);
      // If unauthorized, logout
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
