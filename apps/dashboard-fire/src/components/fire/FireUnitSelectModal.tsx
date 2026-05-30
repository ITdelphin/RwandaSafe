'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fireApi } from '../../lib/apiClient';
import { UNIT_COLORS } from '../../constants/theme';

interface Props {
  incidentId: string;
  fireType?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function FireUnitSelectModal({ incidentId, fireType, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState('');

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['fire-units-available'],
    queryFn: () => fireApi.getAvailableUnits().then(r => (r.data as any).data ?? []),
  });

  const isChemical = ['CHEMICAL_SPILL', 'GAS_LEAK'].includes(fireType ?? '');
  const selectedUnits = units.filter((u: any) => selected.includes(u.id));
  const hasHazmat = selectedUnits.some((u: any) => u.hazmatKit);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDispatch = async () => {
    if (selected.length === 0) { setError('Select at least one unit'); return; }
    setError('');
    setDispatching(true);
    try {
      await fireApi.dispatch(incidentId, { unitIds: selected });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Dispatch failed');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Dispatch Fire Units</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {isChemical && !hasHazmat && selected.length > 0 && (
              <div className="mb-3 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs font-semibold text-amber-800">
                ⚠️ Warning: No hazmat-equipped unit selected for chemical/gas incident
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading units...</div>
            ) : units.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No available units</div>
            ) : (
              <div className="space-y-2">
                {units.map((unit: any) => {
                  const isSelected = selected.includes(unit.id);
                  return (
                    <label
                      key={unit.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        isSelected ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(unit.id)}
                        className="accent-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{unit.callSign ?? unit.id}</span>
                          {unit.hazmatKit && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
                              HAZMAT
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {unit.unitType ?? 'Engine'} · {unit.waterCapacity != null ? `${unit.waterCapacity}L water` : ''} · {unit.crewCount ?? 0} crew
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: UNIT_COLORS[unit.status] ?? '#64748B' }}
                      >
                        {unit.status}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100">
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                disabled={dispatching || selected.length === 0}
                className="flex-1 px-4 py-2 text-sm text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-50 font-semibold"
              >
                {dispatching ? 'Dispatching...' : `Dispatch ${selected.length > 0 ? `(${selected.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
