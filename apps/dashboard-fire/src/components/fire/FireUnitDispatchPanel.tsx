'use client';
import { useState } from 'react';
import { fireApi } from '../../lib/apiClient';
import { UNIT_COLORS, UNIT_TRANSITIONS } from '../../constants/theme';
import { FireUnitSelectModal } from './FireUnitSelectModal';

interface Props {
  incidentId: string;
  fireReport?: any;
  onRefresh: () => void;
}

export function FireUnitDispatchPanel({ incidentId, fireReport, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [updatingUnit, setUpdatingUnit] = useState<string | null>(null);

  const dispatchedUnits: any[] = fireReport?.dispatchedUnits ?? [];

  const handleStatusUpdate = async (unitId: string, newStatus: string) => {
    setUpdatingUnit(unitId);
    try {
      await fireApi.updateUnitStatus(unitId, { status: newStatus });
      onRefresh();
    } finally {
      setUpdatingUnit(null);
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-orange-800 uppercase tracking-wide">Dispatched Units</h4>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs px-2 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          + Dispatch Units
        </button>
      </div>

      {dispatchedUnits.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <div className="text-3xl mb-2">🚒</div>
          <div className="text-xs">No units dispatched yet</div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 px-4 py-2 text-xs text-white bg-orange-600 rounded-xl hover:bg-orange-700 font-semibold"
          >
            Dispatch Units
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {dispatchedUnits.map((unit: any) => {
            const transitions = UNIT_TRANSITIONS[unit.status] ?? [];
            return (
              <div key={unit.id} className="bg-white rounded-xl p-3 border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-sm text-gray-900">{unit.callSign}</span>
                    <span className="text-xs text-gray-500 ml-2">{unit.unitType}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: UNIT_COLORS[unit.status] ?? '#64748B' }}
                  >
                    {unit.status}
                  </span>
                </div>
                {transitions.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {transitions.map((newStatus: string) => (
                      <button
                        key={newStatus}
                        onClick={() => handleStatusUpdate(unit.id, newStatus)}
                        disabled={updatingUnit === unit.id}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        → {newStatus}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <FireUnitSelectModal
          incidentId={incidentId}
          fireType={fireReport?.fireType}
          onClose={() => setShowModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
