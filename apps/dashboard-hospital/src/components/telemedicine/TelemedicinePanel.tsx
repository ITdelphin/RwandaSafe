'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalApi } from '../../lib/apiClient';
import { timeAgo } from '../../lib/formatters';

interface Props { incidentId: string; citizenUserId?: string; existingSession?: any; }

export function TelemedicinePanel({ incidentId, citizenUserId, existingSession }: Props) {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(existingSession);
  const qc = useQueryClient();

  const start = async () => {
    setLoading(true);
    try {
      const r: any = await medicalApi.telemedicine(incidentId, { citizenUserId });
      setSession(r.data.data);
    } finally { setLoading(false); }
  };

  if (!session) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="text-xs font-bold text-blue-700 uppercase mb-2">Telemedicine</h3>
        <p className="text-xs text-gray-500 mb-3">Start a video consultation for non-critical cases.</p>
        <button onClick={start} disabled={loading}
          className="w-full text-xs text-white py-2 rounded-lg font-medium disabled:opacity-50"
          style={{ backgroundColor: '#1B5E82' }}>
          {loading ? 'Starting...' : '💻 Start Telemedicine Session'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
      <h3 className="text-xs font-bold text-blue-700 uppercase mb-3">Telemedicine Session</h3>
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${session.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`} />
          <span className="text-xs text-gray-600">
            {session.status === 'PENDING' ? 'Waiting for citizen to join...' :
             session.status === 'ACTIVE' ? `Session in progress · ${session.startedAt ? timeAgo(session.startedAt) : ''}` :
             'Session ended'}
          </span>
        </div>
        <p className="text-xs text-gray-500">✅ Citizen notified via push notification</p>
      </div>
      {session.sessionUrl && (
        <a href={session.sessionUrl} target="_blank" rel="noreferrer"
          className="block w-full text-center text-xs text-white py-2 rounded-lg font-medium"
          style={{ backgroundColor: '#1B5E82' }}>
          🎥 Open Video Call
        </a>
      )}
    </div>
  );
}
