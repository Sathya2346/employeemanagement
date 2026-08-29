import apiClient from './apiClient';

export const leaveApi = {
  getAll: () => apiClient.get('/api/leave/all'),
  getUserLeaves: (employeeId) => apiClient.get(`/api/leave/userLeave/${employeeId}`),
  apply: (data) => apiClient.post('/api/leave/apply', data),
  approve: (id) => apiClient.post(`/api/leave/approve/${id}`),
  reject: (id) => apiClient.post(`/api/leave/reject/${id}`),
  cancel: (id) => apiClient.post(`/api/leave/cancel/${id}`),
};
