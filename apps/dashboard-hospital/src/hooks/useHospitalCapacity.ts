'use client';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { capacityApi } from '../lib/apiClient';

export function useHospitalCapacity() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['capacity'],
    queryFn: () => capacityApi.getAll().then(r => r.data.data ?? []),
    refetchInterval: 120000,
  });

  useEffect(() => {
    let socket: any;
    try {
      const { getSocket } = require('../lib/socket');
      socket = getSocket();
      socket.on('capacity:updated', (data: any) => {
        qc.setQueryData(['capacity'], (old: any[]) =>
          (old ?? []).map(h => h.agencyId === data.agencyId ? { ...h, ...data } : h)
        );
      });
    } catch {}
    return () => { if (socket) socket.off('capacity:updated'); };
  }, [qc]);

  const hospitals: any[] = Array.isArray(query.data) ? query.data : [];
  const totalBedsAvailable = hospitals.reduce((sum, h) => sum + (h.emergencyBedsAvail ?? 0), 0);
  const criticalHospitals = hospitals.filter(h => h.icuBedsAvail === 0 || !h.isAcceptingPatients);

  return { ...query, hospitals, totalBedsAvailable, criticalHospitals };
}
