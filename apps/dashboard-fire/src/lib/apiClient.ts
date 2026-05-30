import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
export const apiClient = axios.create({ baseURL: API_BASE_URL });
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fire_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
apiClient.interceptors.response.use(res => res, error => {
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('fire_access_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
export const dashboardApi = {
  getIncidents: (params?: any) => apiClient.get('/dashboard/incidents', { params }),
  getStats: (agencyType = 'FIRE') => apiClient.get('/dashboard/stats', { params: { agencyType } }),
  getMapData: (agencyType = 'FIRE') => apiClient.get('/dashboard/map', { params: { agencyType } }),
  getOfficers: (agencyType = 'FIRE') => apiClient.get('/dashboard/officers', { params: { agencyType } }),
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
export const fireApi = {
  createReport: (incidentId: string, data: any) => apiClient.post(`/fire/${incidentId}/report`, data),
  dispatch: (incidentId: string, data: any) => apiClient.post(`/fire/${incidentId}/dispatch`, data),
  updateUnitStatus: (id: string, data: any) => apiClient.patch(`/fire/units/${id}/status`, data),
  getHydrants: (incidentId: string) => apiClient.get(`/fire/${incidentId}/hydrants`),
  getWeather: (incidentId: string) => apiClient.get(`/fire/${incidentId}/weather`),
  searchChemical: (q: string) => apiClient.get('/fire/chemicals', { params: { q } }),
  submitPostReport: (incidentId: string, data: any) => apiClient.post(`/fire/${incidentId}/post-report`, data),
  getUnits: () => apiClient.get('/fire/units'),
  getAvailableUnits: () => apiClient.get('/fire/units/available'),
  getReports: (params?: any) => apiClient.get('/fire/reports', { params }),
};
export const officersApi = {
  list: (params?: any) => apiClient.get('/officers', { params }),
  getById: (id: string) => apiClient.get(`/officers/${id}`),
  toggleDuty: (id: string) => apiClient.patch(`/officers/${id}/duty`),
  updateLocation: (id: string, data: any) => apiClient.patch(`/officers/${id}/location`, data),
};
export const authApi = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  register: (data: any) => apiClient.post('/auth/register', data),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
  // Keep OTP for citizen
  requestOtp: (phone: string) => apiClient.post('/auth/otp/request', { phone }),
  verifyOtp: (phone: string, code: string) => apiClient.post('/auth/otp/verify', { phone, code }),
};
