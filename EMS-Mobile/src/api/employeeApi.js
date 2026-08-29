import apiClient from './apiClient';

export const employeeApi = {
  getAll: () => apiClient.get('/api/employees/all'),
  getById: (id) => apiClient.get(`/api/employees/${id}`),
  save: (data) => apiClient.post('/api/employees/save', data),
  update: (id, data) => apiClient.put(`/api/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/api/employees/delete/${id}`),
};
