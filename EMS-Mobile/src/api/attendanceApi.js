import apiClient from './apiClient';

export const attendanceApi = {
  getToday: (employeeId) => apiClient.get(`/api/attendance/today/${employeeId}`),
  checkIn: (employeeId) => apiClient.post(`/api/attendance/check-in/${employeeId}`),
  checkOut: (employeeId) => apiClient.post(`/api/attendance/check-out/${employeeId}`),
  getLast5Days: (employeeId) => apiClient.get(`/api/attendance/last5/${employeeId}`),
  getRange: (employeeId, from, to) => apiClient.get(`/api/attendance/range/${employeeId}?from=${from}&to=${to}`),
  breakStart: (time) => apiClient.post('/api/attendance/break/start', { time }),
  breakEnd: (time) => apiClient.post('/api/attendance/break/end', { time }),
  meetingStart: (employeeId, platform, link) => apiClient.post(`/api/attendance/meetingin/${employeeId}`, { platform, meetingLink: link }),
  meetingEnd: (employeeId) => apiClient.post(`/api/attendance/end-meeting/${employeeId}`),
  rectify: (attendanceId, reason) => apiClient.post(`/api/attendance/admin/rectify/${attendanceId}?reason=${encodeURIComponent(reason || '')}`),

  // ═══ AUTO-DETECT: Meeting status reporting & polling ═══
  reportMeetingStatus: (employeeId, status, platform = 'mobile') =>
    apiClient.post(`/api/attendance/meeting-status/${employeeId}`, {
      status,
      platform,
      meetingLink: null,
    }),
  getMeetingStatus: (employeeId) => apiClient.get(`/api/attendance/meeting-status/${employeeId}`),
};
