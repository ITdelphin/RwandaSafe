import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on each request
if (typeof window !== 'undefined') {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
            localStorage.setItem('accessToken', data.data.accessToken);
            error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return axios(error.config);
          } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }
      return Promise.reject(error);
    }
  );
}

export const incidentsApi = {
  create: (data: any) => apiClient.post('/incidents', data),
  list: (params?: any) => apiClient.get('/incidents', { params }),
  getById: (id: string) => apiClient.get(`/incidents/${id}`),
  track: (code: string) => apiClient.get(`/incidents/track/${code}`),
  getNotes: (id: string) => apiClient.get(`/incidents/${id}/notes`),
  addNote: (id: string, note: string) => apiClient.post(`/incidents/${id}/notes`, { note }),
  uploadMedia: (id: string, formData: FormData) =>
    apiClient.post(`/incidents/${id}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const authApi = {
  requestOtp: (phone: string) => apiClient.post('/auth/register', { phone }),
  verifyOtp: (phone: string, code: string) => apiClient.post('/auth/verify', { phone, code }),
};

export const alertsApi = {
  getActive: () => apiClient.get('/alerts/active'),
};
