import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('admin_access_token', data.data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return apiClient(error.config);
        } catch {
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  register: (data: any) => apiClient.post('/auth/register', data),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
  requestOtp: (phone: string) => apiClient.post('/auth/otp/request', { phone }),
  verifyOtp: (phone: string, code: string) => apiClient.post('/auth/otp/verify', { phone, code }),
};

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: (params?: Record<string, any>) => apiClient.get('/admin/users', { params }),
  getUser: (id: string) => apiClient.get(`/admin/users/${id}`),
  createUser: (data: any) => apiClient.post('/admin/users', data),
  updateUser: (id: string, data: any) => apiClient.patch(`/admin/users/${id}`, data),
  suspendUser: (id: string) => apiClient.post(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => apiClient.post(`/admin/users/${id}/activate`),
  getPendingApprovals: () => apiClient.get('/admin/approvals/pending'),
  approveRole: (userId: string, data: { role: string; agency: string }) => apiClient.post(`/admin/approvals/${userId}/approve`, data),
  rejectRole: (userId: string, reason?: string) => apiClient.post(`/admin/approvals/${userId}/reject`, { reason }),
  getAgencies: () => apiClient.get('/admin/agencies'),
  createAgency: (data: any) => apiClient.post('/admin/agencies', data),
  updateAgency: (id: string, data: any) => apiClient.patch(`/admin/agencies/${id}`, data),
  getAuditLogs: (params?: Record<string, any>) => apiClient.get('/admin/audit-logs', { params }),
  getSystemHealth: () => apiClient.get('/admin/system-health'),
  getBroadcasts: () => apiClient.get('/admin/broadcasts'),
  createBroadcast: (data: any) => apiClient.post('/admin/broadcasts', data),
  deleteBroadcast: (id: string) => apiClient.delete(`/admin/broadcasts/${id}`),
};
