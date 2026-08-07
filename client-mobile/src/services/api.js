import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL configuration
const BASE_URL = 'http://10.0.2.2:8080/api'; // Android Emulator localhost
// const BASE_URL = 'http://localhost:8080/api'; // iOS Simulator localhost
// const BASE_URL = 'http://<YOUR_LOCAL_IP>:8080/api'; // Physical Device

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for session cookies if backend uses them
});

// Request interceptor to attach token if using JWT (Optional depending on backend)
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

// Response interceptor to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., clear session and navigate to login)
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // Navigation dispatch can be handled globally or in AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
