import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
export const apiClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rib_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
apiClient.interceptors.response.use(res => res, async (error) => {
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('rib_refresh_token');
    if (refreshToken && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
        localStorage.setItem('rib_access_token', data.data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(error.config);
      } catch {
        localStorage.removeItem('rib_access_token');
        localStorage.removeItem('rib_refresh_token');
        localStorage.removeItem('rib_user');
        window.location.href = '/login';
      }
    } else {
      localStorage.removeItem('rib_access_token');
      localStorage.removeItem('rib_user');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});
export const dashboardApi = {
  getIncidents: (params?: any) => apiClient.get('/dashboard/incidents', { params }),
  getStats: (agencyType = 'RIB') => apiClient.get('/dashboard/stats', { params: { agencyType } }),
  getMapData: (agencyType = 'RIB') => apiClient.get('/dashboard/map', { params: { agencyType } }),
  getOfficers: (agencyType = 'RIB') => apiClient.get('/dashboard/officers', { params: { agencyType } }),
  forwardIncident: (data: any) => apiClient.post('/dashboard/forward', data),
  createHandover: (data: any) => apiClient.post('/dashboard/handover', data),
  getLatestHandover: () => apiClient.get('/dashboard/handover/latest'),
};
export const incidentsApi = {
  getById: (id: string) => apiClient.get(`/incidents/${id}`),
  assign: (id: string, data: any) => apiClient.post(`/incidents/${id}/assign`, data),
  updateStatus: (id: string, data: any) => apiClient.patch(`/incidents/${id}/status`, data),
  addNote: (id: string, data: any) => apiClient.post(`/incidents/${id}/notes`, data),
};
export const investigationApi = {
  create: (data: any) => apiClient.post('/investigations', data),
  list: (params?: any) => apiClient.get('/investigations', { params }),
  getById: (id: string) => apiClient.get(`/investigations/${id}`),
  updateStatus: (id: string, data: any) => apiClient.patch(`/investigations/${id}/status`, data),
  linkIncidents: (id: string, data: any) => apiClient.post(`/investigations/${id}/link-incidents`, data),
  close: (id: string, data: any) => apiClient.post(`/investigations/${id}/close`, data),
  addSuspect: (id: string, data: any) => apiClient.post(`/investigations/${id}/suspects`, data),
  updateSuspectStatus: (id: string, suspectId: string, data: any) => apiClient.patch(`/investigations/${id}/suspects/${suspectId}`, data),
  getEvidence: (id: string) => apiClient.get(`/investigations/${id}/evidence`),
  addEvidence: (id: string, data: any) => apiClient.post(`/investigations/${id}/evidence`, data),
  deleteEvidence: (id: string, evidenceId: string) => apiClient.delete(`/investigations/${id}/evidence/${evidenceId}`),
};
export const patternApi = {
  list: (params?: any) => apiClient.get('/patterns', { params }),
  getAlerts: () => apiClient.get('/patterns/alerts'),
  review: (id: string, data: any) => apiClient.patch(`/patterns/${id}/review`, data),
};
export const tiplineApi = {
  list: (params?: any) => apiClient.get('/tips', { params }),
  getById: (id: string) => apiClient.get(`/tips/${id}`),
  updateStatus: (id: string, data: any) => apiClient.patch(`/tips/${id}/status`, data),
};
export const authApi = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  register: (data: any) => apiClient.post('/auth/register', data),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
  requestOtp: (phone: string) => apiClient.post('/auth/otp/request', { phone }),
  verifyOtp: (phone: string, code: string) => apiClient.post('/auth/otp/verify', { phone, code }),
};
