'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/apiClient';

export function useMapData(agencyType = 'POLICE') {
  return useQuery({
    queryKey: ['map-data', agencyType],
    queryFn: () => dashboardApi.getMapData(agencyType).then((r: any) => r.data.data),
    refetchInterval: 30000,
  });
}
