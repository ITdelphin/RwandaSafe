'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fireApi } from '../../../lib/apiClient';
import { UNIT_COLORS } from '../../../constants/theme';
import { LiveMap } from '../../../components/map/LiveMap';

function UnitRow({ unit, onStatusChange }: { unit: any; onStatusChange: (id: string, status: string) => void }) {
  const color = UNIT_COLORS[unit.status] ?? '#64748B';
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-bold text-sm text-gray-900">{unit.callSign}</span>
          {unit.hazmatKit && (
            <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">HAZMAT</span>
          )}
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {unit.status}
        </span>
      </div>
      <div className="text-xs text-gray-500 space-y-0.5">
        <div>Type: <span className="text-gray-700 font-medium">{unit.unitType ?? '—'}</span></div>
        {unit.waterCapacity != null && (
          <div>Water: <span className="text-gray-700 font-medium">{unit.waterCapacity}L</span></div>
        )}
        <div>Crew: <span className="text-gray-700 font-medium">{unit.crewCount ?? 0} personnel</span></div>
      </div>
    </div>
  );
}

export default function DispatchPage() {
  const { data: units = [], isLoading, refetch } = useQuery({
    queryKey: ['fire-units-dispatch'],
    queryFn: () => fireApi.getUnits().then(r => (r.data as any).data ?? []),
    refetchInterval: 15000,
  });

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fireApi.updateUnitStatus(id, { status });
      refetch();
    } catch {}
  };

  const grouped = {
    AVAILABLE: units.filter((u: any) => u.status === 'AVAILABLE'),
    RESPONDING: units.filter((u: any) => u.status === 'RESPONDING'),
    ON_SCENE: units.filter((u: any) => u.status === 'ON_SCENE'),
    RETURNING: units.filter((u: any) => u.status === 'RETURNING'),
    OTHER: units.filter((u: any) => !['AVAILABLE', 'RESPONDING', 'ON_SCENE', 'RETURNING'].includes(u.status)),
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Left panel - Fleet list (40%) */}
      <div className="w-2/5 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Fire Fleet</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            Live
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(UNIT_COLORS).slice(0, 4).map(([status, color]) => {
            const count = units.filter((u: any) => u.status === status).length;
            return (
              <div key={status} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <div>
                  <div className="text-lg font-bold text-gray-900">{count}</div>
                  <div className="text-[10px] text-gray-500">{status}</div>
                </div>
              </div>
            );
          })}
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading units...</div>
        ) : units.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No units found</div>
        ) : (
          <div className="space-y-2">
            {units.map((unit: any) => (
              <UnitRow key={unit.id} unit={unit} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      {/* Right panel - Map (60%) */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: '500px' }}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Live Incident Map</h2>
        </div>
        <div className="h-full">
          <LiveMap />
        </div>
      </div>
    </div>
  );
}
