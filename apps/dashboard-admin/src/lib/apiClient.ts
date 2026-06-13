import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  register: (data: any) => apiClient.post('/auth/register', data),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
};

export const adminApi = {
  getStats: (params?: Record<string, any>) => apiClient.get('/admin/stats', { params }),
  getScorecard: () => apiClient.get('/admin/scorecard'),
  getMapData: () => apiClient.get('/admin/map'),
  getHeatMap: (params?: Record<string, any>) => apiClient.get('/admin/heatmap', { params }),
  getAnimatedHeatMap: (params?: Record<string, any>) => apiClient.get('/admin/heatmap/animated', { params }),
  listUsers: (params?: Record<string, any>) => apiClient.get('/admin/users', { params }),
  getUserDetail: (id: string) => apiClient.get(`/admin/users/${id}`),
  createOfficer: (data: any) => apiClient.post('/admin/users/officer', data),
  suspendUser: (id: string, reason: string) => apiClient.patch(`/admin/users/${id}/suspend`, { reason }),
  reactivateUser: (id: string) => apiClient.patch(`/admin/users/${id}/reactivate`),
  promoteToOfficer: (id: string, data: { role: string; agencyId: string; badgeNumber?: string; rank?: string }) => apiClient.post(`/admin/users/${id}/promote`, data),
  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
  sendBroadcast: (data: any) => apiClient.post('/admin/broadcast', data),
  getBroadcasts: () => apiClient.get('/admin/broadcasts'),
  deactivateBroadcast: (id: string) => apiClient.delete(`/admin/broadcasts/${id}`),
  getAuditLog: (params?: Record<string, any>) => apiClient.get('/admin/audit', { params }),
  getSystemHealth: () => apiClient.get('/admin/health'),
  getSystemConfigs: () => apiClient.get('/admin/config'),
  updateSystemConfig: (key: string, value: string) => apiClient.patch(`/admin/config/${key}`, { value }),
};

export const slaApi = {
  getConfigs: () => apiClient.get('/sla'),
  updateConfig: (id: string, data: any) => apiClient.patch(`/sla/${id}`, data),
  getBreaches: (params?: Record<string, any>) => apiClient.get('/sla/breaches', { params }),
};

export const opendataApi = {
  exportData: (params?: Record<string, any>) => apiClient.get('/opendata/export', { params, responseType: 'blob' }),
  getSummary: () => apiClient.get('/opendata/summary'),
};
