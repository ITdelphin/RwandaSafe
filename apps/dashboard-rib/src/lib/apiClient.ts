import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
export const apiClient = axios.create({ baseURL: API_BASE_URL });
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rib_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
apiClient.interceptors.response.use(res => res, error => {
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('rib_access_token');
    window.location.href = '/login';
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
  updateSuspect: (suspectId: string, data: any) => apiClient.patch(`/suspects/${suspectId}/status`, data),
  uploadEvidence: (id: string, formData: FormData) => apiClient.post(`/investigations/${id}/evidence`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  listEvidence: (id: string) => apiClient.get(`/investigations/${id}/evidence`),
  getEvidenceUrl: (evidenceId: string) => apiClient.get(`/evidence/${evidenceId}/url`),
  exportPdf: (id: string) => apiClient.get(`/investigations/${id}/export-pdf`, { responseType: 'blob' }),
};
export const patternApi = {
  getAlerts: () => apiClient.get('/patterns/alerts'),
  review: (id: string, data: any) => apiClient.patch(`/patterns/${id}/review`, data),
  run: () => apiClient.post('/patterns/run'),
};
export const tiplineApi = {
  list: (params?: any) => apiClient.get('/tips', { params }),
  review: (id: string, data: any) => apiClient.patch(`/tips/${id}/review`, data),
};
export const officersApi = {
  list: (params?: any) => apiClient.get('/officers', { params }),
  getById: (id: string) => apiClient.get(`/officers/${id}`),
  toggleDuty: (id: string) => apiClient.patch(`/officers/${id}/duty`),
  updateLocation: (id: string, data: any) => apiClient.patch(`/officers/${id}/location`, data),
};
export const authApi = {
  requestOtp: (phone: string) => apiClient.post('/auth/login', { phone }),
  verifyOtp: (phone: string, code: string) => apiClient.post('/auth/verify', { phone, code }),
};
