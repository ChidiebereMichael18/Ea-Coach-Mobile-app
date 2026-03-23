import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@ea_user');
      const storedToken = await AsyncStorage.getItem('@ea_token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      await AsyncStorage.setItem('@ea_token', token);
      await AsyncStorage.setItem('@ea_user', JSON.stringify(userData));
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);
      setError(null);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      const { token, ...user } = response.data;
      
      await AsyncStorage.setItem('@ea_token', token);
      await AsyncStorage.setItem('@ea_user', JSON.stringify(user));
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(user);
      setError(null);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed');
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (newUserData) => {
    try {
      setLoading(true);
      // Optional: API call could go here if the backend supports it
      // const response = await api.put('/user/profile', newUserData);
      // const updatedUser = response.data;
      
      const updatedUser = { ...user, ...newUserData };
      await AsyncStorage.setItem('@ea_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@ea_token');
      await AsyncStorage.removeItem('@ea_user');
      delete api.defaults.headers.Authorization;
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};