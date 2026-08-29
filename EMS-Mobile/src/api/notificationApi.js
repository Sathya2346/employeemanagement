import apiClient from './apiClient';

export const notificationApi = {
  getAdminNotifications: () => apiClient.get('/api/notifications/admin'),
  getUserNotifications: (userId) => apiClient.get(`/api/notifications/user/${userId}`),
  getUnreadCount: (username, isAdmin = false) => apiClient.get(`/api/notifications/unread/count?username=${encodeURIComponent(username || '')}&isAdmin=${isAdmin}`),
  markRead: (id) => apiClient.post(`/api/notifications/mark-read/${id}`),
  markAllRead: (recipient, type) => apiClient.post('/api/notifications/mark-all-read', { recipient, type }),
};
