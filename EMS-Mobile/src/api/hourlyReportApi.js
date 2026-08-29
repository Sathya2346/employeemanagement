import apiClient from './apiClient';

export const hourlyReportApi = {
  submit: (employeeId, reports) => apiClient.post('/api/hourly-reports/submit', { employeeId, reports }),
  getEmployeeReports: (employeeId) => apiClient.get(`/api/hourly-reports/employee/${employeeId}`),
  getAll: () => apiClient.get('/api/hourly-reports/all'),
};
