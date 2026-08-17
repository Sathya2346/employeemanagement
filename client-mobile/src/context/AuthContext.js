import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
    } catch (e) {
      console.error('Failed to load user data from storage', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { username: email, email, password });
      
      // Store user info and token (if your backend provides a token)
      const userData = response.data.user || response.data; 
      // If token is provided: await AsyncStorage.setItem('userToken', response.data.token);
      
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); // Call backend logout if it exists
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
