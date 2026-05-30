import { apiClient } from './client';

export const incidentsApi = {
  create: (data: any) => apiClient.post('/incidents', data),
  list: (params?: any) => apiClient.get('/incidents', { params }),
  getById: (id: string) => apiClient.get(`/incidents/${id}`),
  track: (code: string) => apiClient.get(`/incidents/track/${code}`),
  updateStatus: (id: string, data: any) => apiClient.patch(`/incidents/${id}/status`, data),
  addNote: (id: string, note: string, isInternal = false) =>
    apiClient.post(`/incidents/${id}/notes`, { note, isInternal }),
  getNotes: (id: string) => apiClient.get(`/incidents/${id}/notes`),
  getHistory: (id: string) => apiClient.get(`/incidents/${id}/history`),
  cancel: (id: string) => apiClient.post(`/incidents/${id}/cancel`),
  feedback: (id: string, rating: number, comment?: string) =>
    apiClient.post(`/incidents/${id}/feedback`, { rating, comment }),
  uploadMedia: (id: string, formData: FormData) =>
    apiClient.post(`/incidents/${id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
