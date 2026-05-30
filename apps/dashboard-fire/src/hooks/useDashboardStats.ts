'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/apiClient';

export function useDashboardStats(agencyType = 'POLICE') {
  return useQuery({
    queryKey: ['dashboard-stats', agencyType],
    queryFn: () => dashboardApi.getStats(agencyType).then(r => (r.data as any).data),
    refetchInterval: 60000,
  });
}
