'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { medicalApi } from '../../lib/apiClient';

interface Props { incidentId: string; onAssigned: () => void; }

export function HospitalRecommendation({ incidentId, onAssigned }: Props) {
  const [assigning, setAssigning] = useState('');

  const { data: recs = [], isLoading } = useQuery({
    queryKey: ['hospital-recs', incidentId],
    queryFn: () => medicalApi.recommend(incidentId).then((r: any) => r.data.data ?? []),
  });

  const assign = useMutation({
    mutationFn: (hospitalId: string): any => medicalApi.assignHospital(incidentId, { hospitalId }),
    onSuccess: onAssigned,
  });

  if (isLoading) return <div className="text-xs text-gray-400 py-2">Loading recommendations...</div>;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-500 uppercase">Recommended Hospitals</h3>
      {recs.length === 0 ? (
        <p className="text-xs text-gray-400">No hospitals available.</p>
      ) : recs.map((h: any, i: number) => (
        <div key={h.id ?? h.agencyId} className="border border-gray-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {i + 1}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">{h.name}</div>
            <div className="text-xs text-gray-500">
              {h.distance != null ? `${h.distance} km · ` : ''}{h.emergencyBedsAvail} beds · ICU: {h.icuBedsAvail}
              {h.hasRequiredBlood === true && ' · 🩸 ✅'}
              {h.hasRequiredBlood === false && ' · 🩸 ❌'}
            </div>
          </div>
          <button onClick={() => assign.mutate(h.agencyId ?? h.id)} disabled={assign.isPending}
            className="text-xs text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
            style={{ backgroundColor: '#C62828' }}>
            Assign
          </button>
        </div>
      ))}
    </div>
  );
}
