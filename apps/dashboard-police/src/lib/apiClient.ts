import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // TODO: use httpOnly cookies in production instead of localStorage
    const token = localStorage.getItem('police_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('police_access_token');
      localStorage.removeItem('police_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dashboardApi = {
  getIncidents: (params?: Record<string, any>) => apiClient.get('/dashboard/incidents', { params }),
  getMapData: (agencyType = 'POLICE') => apiClient.get('/dashboard/map', { params: { agencyType } }),
  getStats: (agencyType = 'POLICE') => apiClient.get('/dashboard/stats', { params: { agencyType } }),
  getOfficers: (agencyType = 'POLICE') => apiClient.get('/dashboard/officers', { params: { agencyType } }),
  forwardIncident: (data: { incidentId: string; targetAgency: string; note?: string }) =>
    apiClient.post('/dashboard/forward', data),
  createHandover: (data: { summary: string }) => apiClient.post('/dashboard/handover', data),
  getLatestHandover: () => apiClient.get('/dashboard/handover/latest'),
};

export const incidentsApi = {
  getById: (id: string) => apiClient.get(`/incidents/${id}`),
  assign: (id: string, data: { officerId: string; notes?: string }) =>
    apiClient.post(`/incidents/${id}/assign`, data),
  updateStatus: (id: string, data: { status: string; note?: string }) =>
    apiClient.patch(`/incidents/${id}/status`, data),
  addNote: (id: string, data: { note: string; isInternal: boolean }) =>
    apiClient.post(`/incidents/${id}/notes`, data),
};

export const officersApi = {
  list: (params?: Record<string, any>) => apiClient.get('/officers', { params }),
  getById: (id: string) => apiClient.get(`/officers/${id}`),
  toggleDuty: (id: string) => apiClient.patch(`/officers/${id}/duty`),
  updateLocation: (id: string, data: { lat: number; lng: number }) =>
    apiClient.patch(`/officers/${id}/location`, data),
};

export const authApi = {
  requestOtp: (phone: string) => apiClient.post('/auth/request-otp', { phone }),
  verifyOtp: (phone: string, code: string) => apiClient.post('/auth/verify', { phone, code }),
};
