'use client';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ambulanceApi } from '../lib/apiClient';

export function useAmbulanceFleet() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['ambulances'],
    queryFn: () => ambulanceApi.list().then((r: any) => r.data.data ?? []),
    refetchInterval: 30000,
  });

  useEffect(() => {
    let socket: any;
    try {
      const { getSocket } = require('../lib/socket');
      socket = getSocket();
      socket.on('ambulance:updated', (data: any) => {
        qc.setQueryData(['ambulances'], (old: any[]) =>
          (old ?? []).map(a => a.id === data.id ? { ...a, ...data } : a)
        );
      });
    } catch {}
    return () => { if (socket) socket.off('ambulance:updated'); };
  }, [qc]);

  const ambulances: any[] = Array.isArray(query.data) ? query.data : [];
  return {
    ...query,
    ambulances,
    availableCount: ambulances.filter(a => a.status === 'AVAILABLE').length,
    dispatchedCount: ambulances.filter(a => a.status === 'DISPATCHED').length,
  };
}
