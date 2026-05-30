'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, officersApi } from '../lib/apiClient';

export function useOnDutyOfficers(agencyType = 'POLICE') {
  return useQuery({
    queryKey: ['on-duty-officers', agencyType],
    queryFn: () => dashboardApi.getOfficers(agencyType).then(r => r.data.data),
    refetchInterval: 30000,
  });
}

export function useAllOfficers(search?: string) {
  return useQuery({
    queryKey: ['all-officers', search],
    queryFn: () => officersApi.list({ search }).then(r => r.data.data),
    refetchInterval: 60000,
  });
}
