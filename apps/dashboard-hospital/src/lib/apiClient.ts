import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({ baseURL: API_BASE_URL, withCredentials: false });

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hospital_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('hospital_access_token');
      localStorage.removeItem('hospital_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dashboardApi = {
  getIncidents: (params?: Record<string, any>) => apiClient.get('/dashboard/incidents', { params }),
  getMapData: (agencyType = 'HOSPITAL') => apiClient.get('/dashboard/map', { params: { agencyType } }),
  getStats: (agencyType = 'HOSPITAL') => apiClient.get('/dashboard/stats', { params: { agencyType } }),
  getOfficers: (agencyType = 'HOSPITAL') => apiClient.get('/dashboard/officers', { params: { agencyType } }),
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

export const medicalApi = {
  setTriage: (incidentId: string, data: any) => apiClient.post(`/medical/${incidentId}/triage`, data),
  dispatch: (incidentId: string, data: any) => apiClient.post(`/medical/${incidentId}/dispatch`, data),
  updateAmbulanceStatus: (id: string, data: any) => apiClient.patch(`/medical/ambulances/${id}/status`, data),
  recommend: (incidentId: string) => apiClient.get(`/medical/${incidentId}/recommend`),
  assignHospital: (incidentId: string, data: any) => apiClient.post(`/medical/${incidentId}/hospital`, data),
  massCasualty: (data: any) => apiClient.post('/medical/mass-casualty', data),
  telemedicine: (incidentId: string, data: any) => apiClient.post(`/medical/${incidentId}/telemedicine`, data),
  getBloodBank: () => apiClient.get('/medical/blood-bank'),
};

export const ambulanceApi = {
  list: () => apiClient.get('/ambulances'),
  available: () => apiClient.get('/ambulances/available'),
  updateLocation: (id: string, data: any) => apiClient.patch(`/ambulances/${id}/location`, data),
};

export const capacityApi = {
  getAll: () => apiClient.get('/capacity'),
  getOne: (agencyId: string) => apiClient.get(`/capacity/${agencyId}`),
  update: (agencyId: string, data: any) => apiClient.patch(`/capacity/${agencyId}`, data),
  releaseBed: (agencyId: string, data: any) => apiClient.post(`/capacity/${agencyId}/release-bed`, data),
};

export const authApi = {
  requestOtp: (phone: string) => apiClient.post('/auth/login', { phone }),
  verifyOtp: (phone: string, code: string) => apiClient.post('/auth/verify', { phone, code }),
};

export const officersApi = {
  list: (params?: Record<string, any>) => apiClient.get('/officers', { params }),
  getById: (id: string) => apiClient.get(`/officers/${id}`),
  toggleDuty: (id: string) => apiClient.patch(`/officers/${id}/duty`),
  updateLocation: (id: string, data: any) => apiClient.patch(`/officers/${id}/location`, data),
};
