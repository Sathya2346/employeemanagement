import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'ADMIN' or 'USER'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('auth_user');
      const storedRole = await AsyncStorage.getItem('auth_role');
      if (storedUser && storedRole) {
        const parsedUser = JSON.parse(storedUser);
        
        // Validate session against the server before trusting stored auth
        try {
          const meResponse = await apiClient.get('/api/auth/me');
          if (meResponse.data && meResponse.data.success) {
            // Session is still valid — use server-confirmed data (role might have changed)
            const serverUser = meResponse.data;
            const serverRole = serverUser.role || storedRole;
            setUser(serverUser);
            setRole(serverRole);
            // Update stored data with fresh server data
            await AsyncStorage.setItem('auth_user', JSON.stringify(serverUser));
            await AsyncStorage.setItem('auth_role', serverRole);
          } else {
            // Server says not authenticated — clear stale session
            await clearAuth();
          }
        } catch (sessionError) {
          // Server unreachable or returned 401 — clear stale session
          console.warn('Session validation failed, clearing stored auth:', sessionError.message);
          await clearAuth();
        }
      }
    } catch (e) {
      console.error('Error loading stored auth', e);
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = async () => {
    setUser(null);
    setRole(null);
    await AsyncStorage.removeItem('auth_user');
    await AsyncStorage.removeItem('auth_role');
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await apiClient.post('/api/auth/login', { username, password });
      if (response.data && response.data.success) {
        const userData = response.data;
        const userRole = response.data.role || (username.toLowerCase().includes('admin') ? 'ADMIN' : 'USER');
        
        setUser(userData);
        setRole(userRole);

        await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
        await AsyncStorage.setItem('auth_role', userRole);
        return { success: true, role: userRole };
      } else {
        setError(response.data?.message || 'Login failed');
        return { success: false, message: response.data?.message || 'Login failed' };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (e) {
      // ignore
    }
    await clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, error, login, logout, setUser, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};
