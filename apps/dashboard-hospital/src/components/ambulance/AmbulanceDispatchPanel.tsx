'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AmbulanceSelectModal } from './AmbulanceSelectModal';
import { medicalApi } from '../../lib/apiClient';
import { AMBULANCE_COLORS, AMBULANCE_TRANSITIONS } from '../../constants/theme';
import { timeAgo } from '../../lib/formatters';

interface Props { incidentId: string; medicalCase?: any; onRefresh: () => void; }

export function AmbulanceDispatchPanel({ incidentId, medicalCase, onRefresh }: Props) {
  const [showSelect, setShowSelect] = useState(false);
  const qc = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: (status: string) => medicalApi.updateAmbulanceStatus(medicalCase?.ambulanceId, { status }),
    onSuccess: onRefresh,
  });

  if (!medicalCase?.ambulanceId) {
    return (
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
        <h3 className="text-xs font-bold text-orange-700 uppercase mb-2">Ambulance</h3>
        <p className="text-xs text-gray-500 mb-3">No ambulance dispatched yet.</p>
        <button onClick={() => setShowSelect(true)}
          className="text-xs text-white px-3 py-2 rounded-lg w-full font-medium"
          style={{ backgroundColor: '#C62828' }}>
          🚑 Dispatch Ambulance
        </button>
        {showSelect && <AmbulanceSelectModal incidentId={incidentId} onClose={() => setShowSelect(false)} onSuccess={onRefresh} />}
      </div>
    );
  }

  const ambulance = medicalCase.ambulance;
  const status = ambulance?.status ?? 'DISPATCHED';
  const color = AMBULANCE_COLORS[status] ?? '#94A3B8';
  const nextStatuses = AMBULANCE_TRANSITIONS[status] ?? [];

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
      <h3 className="text-xs font-bold text-orange-700 uppercase mb-3">Ambulance</h3>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <div>
          <div className="text-sm font-bold text-gray-800">{ambulance?.callSign ?? 'AMB-???'}</div>
          <div className="text-xs text-gray-500">{status.replace(/_/g,' ')} · {medicalCase.dispatchedAt ? timeAgo(medicalCase.dispatchedAt) : ''}</div>
        </div>
      </div>
      {nextStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map(s => (
            <button key={s} onClick={() => updateStatus.mutate(s)}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: AMBULANCE_COLORS[s], color: AMBULANCE_COLORS[s] }}>
              → {s.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
