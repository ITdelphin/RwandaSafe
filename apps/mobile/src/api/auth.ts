import { apiClient } from './client';

export const authApi = {
  requestOtp: (phone: string, lang?: string) =>
    apiClient.post('/auth/phone/send', { phone, lang }),

  verifyOtp: (phone: string, code: string) =>
    apiClient.post('/auth/phone/verify', { phone, code }),

  requestEmailOtp: (email: string, lang?: string) =>
    apiClient.post('/auth/email/send', { email, lang }),

  verifyEmailOtp: (email: string, code: string) =>
    apiClient.post('/auth/email/verify', { email, code }),

  createGuestSession: (lang?: string) =>
    apiClient.post('/auth/guest', { lang }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),
};
