import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Resolve Spring Boot backend URL dynamically based on execution platform
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8085';
  } else if (Platform.OS === 'android') {
    // Android Emulator uses 10.0.2.2 to reach host localhost;
    // Real devices should use the production URL via custom_api_url in AsyncStorage.
    return 'http://10.0.2.2:8085';
  } else if (Platform.OS === 'ios') {
    // iOS Simulator uses localhost; real devices should use custom_api_url.
    return 'http://localhost:8085';
  }
  return 'http://localhost:8085';
};

export const DEFAULT_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Send session cookies for Spring Security session persistence
});

// Interceptor to allow dynamically updating API Base URL from AsyncStorage if specified
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const customUrl = await AsyncStorage.getItem('custom_api_url');
      if (customUrl) {
        config.baseURL = customUrl;
      }
    } catch (e) {
      // fallback to default
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
