import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auto-detect local vs production environment for instant zero-delay responses
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.')) {
      return `http://${host}:8085/api`;
    }
  }
  return 'https://employeemanagement-l53v.onrender.com/api';
};

const BASE_URL = getBaseUrl();
console.log('🔗 Mobile API Client connected to:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to attach token if using JWT
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export default api;
