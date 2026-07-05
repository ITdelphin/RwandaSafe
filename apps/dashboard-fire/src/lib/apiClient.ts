import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
export const apiClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fire_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
apiClient.interceptors.response.use(res => res, async (error) => {
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('fire_refresh_token');
    if (refreshToken && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
        localStorage.setItem('fire_access_token', data.data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(error.config);
      } catch {
        localStorage.removeItem('fire_access_token');
        localStorage.removeItem('fire_refresh_token');
        localStorage.removeItem('fire_user');
        window.location.href = '/login';
      }
    } else {
      localStorage.removeItem('fire_access_token');
      localStorage.removeItem('fire_user');
      window.location.href = '/login';
    }
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
  updateUnitLocation: (id: string, data: any) => apiClient.patch(`/fire/units/${id}/location`, data),
  createNearMiss: (data: any) => apiClient.post('/fire/near-miss', data),
};
export const resourcesApi = {
  list: (params?: any) => apiClient.get('/resources', { params }),
};
export const authApi = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  register: (data: any) => apiClient.post('/auth/register', data),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
  requestOtp: (phone: string) => apiClient.post('/auth/otp/request', { phone }),
  verifyOtp: (phone: string, code: string) => apiClient.post('/auth/otp/verify', { phone, code }),
};
