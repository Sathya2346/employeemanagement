import apiClient from './apiClient';

export const settingsApi = {
  getSettings: () => apiClient.get('/api/admin/settings'),
  saveSettings: (settings) => apiClient.post('/api/admin/settings/save', settings),
  addShift: (shift) => apiClient.post('/api/admin/settings/shift/add', shift),
  updateShift: (id, shift) => apiClient.post(`/api/admin/settings/shift/update/${id}`, shift),
  deleteShift: (id) => apiClient.delete(`/api/admin/settings/shift/delete/${id}`),
};
