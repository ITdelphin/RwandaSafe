'use client';
import { useState } from 'react';
import { TriageBadge } from './TriageBadge';
import { TriageModal } from './TriageModal';
import { BLOOD_TYPE_LABELS } from '../../constants/theme';

interface Props { incidentId: string; medicalCase?: any; onRefresh: () => void; }

export function PatientCard({ incidentId, medicalCase, onRefresh }: Props) {
  const [showTriage, setShowTriage] = useState(false);

  return (
    <div className="bg-red-50 rounded-xl border border-red-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-red-700 uppercase">Patient Info</h3>
        <button onClick={() => setShowTriage(true)}
          className="text-xs text-white px-3 py-1 rounded-lg" style={{ backgroundColor: '#C62828' }}>
          {medicalCase ? 'Update Triage' : 'Set Triage'}
        </button>
      </div>
      {medicalCase ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Triage:</span>
            <TriageBadge level={medicalCase.triageLevel} />
          </div>
          {medicalCase.patientAge && <div className="text-xs text-gray-600">Age: {medicalCase.patientAge} · {medicalCase.patientGender || 'Unknown gender'}</div>}
          {medicalCase.patientBloodType && medicalCase.patientBloodType !== 'UNKNOWN' && (
            <div className="text-xs text-gray-600">Blood Type: <span className="font-bold text-red-700">{BLOOD_TYPE_LABELS[medicalCase.patientBloodType]}</span></div>
          )}
          {medicalCase.reportedSymptoms?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {medicalCase.reportedSymptoms.map((s: string) => (
                <span key={s} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}
          <div className="flex gap-3 text-xs text-gray-500">
            {medicalCase.isConscious !== null && <span>Conscious: {medicalCase.isConscious ? '✅' : '❌'}</span>}
            {medicalCase.isBreathing !== null && <span>Breathing: {medicalCase.isBreathing ? '✅' : '❌'}</span>}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400">No triage data yet. Click "Set Triage" to add patient info.</p>
      )}
      {showTriage && <TriageModal incidentId={incidentId} onClose={() => setShowTriage(false)} onSuccess={onRefresh} />}
    </div>
  );
}
