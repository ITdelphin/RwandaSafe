'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../lib/apiClient';

export interface DashboardFilters {
  status?: string;
  type?: string;
  severity?: string;
  district?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  agencyType?: string;
}

export function useIncidentFeed(agencyType = 'POLICE') {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DashboardFilters>({ agencyType, limit: 20 });
  const [newCount, setNewCount] = useState(0);

  const query = useQuery({
    queryKey: ['incidents', agencyType, filters],
    queryFn: () => dashboardApi.getIncidents({ ...filters, agencyType }).then((r: any) => r.data.data),
    refetchInterval: 30000,
  });

  useEffect(() => {
    let socket: any;
    try {
      const { getSocket } = require('../lib/socket');
      socket = getSocket();

      socket.on('incident:new', (incident: any) => {
        setNewCount(c => c + 1);
        queryClient.setQueryData(['incidents', agencyType, filters], (old: any) => {
          if (!old) return old;
          return { ...old, data: [incident, ...(old.data ?? [])] };
        });
      });

      socket.on('incident:updated', (update: any) => {
        queryClient.setQueryData(['incidents', agencyType, filters], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            data: (old.data ?? []).map((inc: any) =>
              inc.id === update.id ? { ...inc, ...update } : inc
            ),
          };
        });
      });
    } catch {}

    return () => {
      if (socket) {
        socket.off('incident:new');
        socket.off('incident:updated');
      }
    };
  }, [agencyType, filters, queryClient]);

  const resetNewCount = () => setNewCount(0);

  return { ...query, filters, setFilters, newCount, resetNewCount };
}
