import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '../api/incidents';

export function useIncidents(params?: any) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => incidentsApi.list(params).then((r) => r.data.data),
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useIncidentByCode(code: string) {
  return useQuery({
    queryKey: ['incident-track', code],
    queryFn: () => incidentsApi.track(code).then((r) => r.data.data),
    enabled: !!code,
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => incidentsApi.create(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  });
}

export function useAddNote(incidentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ note, isInternal }: { note: string; isInternal?: boolean }) =>
      incidentsApi.addNote(incidentId, note, isInternal).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incident', incidentId] }),
  });
}

export function useCancelIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incidentsApi.cancel(id).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  });
}
