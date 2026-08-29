import apiClient from './apiClient';

export const authApi = {
  login: (username, password) => apiClient.post('/api/auth/login', { username, password }),
  logout: () => apiClient.post('/api/auth/logout'),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => apiClient.post('/api/auth/verify-otp', { email, otp }),
  resetPassword: (email, password) => apiClient.post('/api/auth/reset-password', { email, password }),
};
