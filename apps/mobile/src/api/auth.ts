import { apiClient } from './client';

export const authApi = {
  requestOtp: (phone: string, name?: string) =>
    apiClient.post('/auth/register', { phone, name }),

  verifyOtp: (phone: string, code: string) =>
    apiClient.post('/auth/verify', { phone, code }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),
};
