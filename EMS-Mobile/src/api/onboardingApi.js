import apiClient from './apiClient';

export const onboardingApi = {
  submit: (formData) => apiClient.post('/api/onboarding/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDetails: (employeeId) => apiClient.get(`/api/onboarding/details/${employeeId}`),
};
