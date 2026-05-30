import { apiClient } from './client';

export const alertsApi = {
  getActive: () => apiClient.get('/alerts/active'),
};
