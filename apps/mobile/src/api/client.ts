import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = (process.env as any).EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          useAuthStore.getState().setAccessToken(data.data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return axios(error.config);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  }
);
