'use client';
import { useHospitalCapacity } from '../../../hooks/useHospitalCapacity';
import { HospitalCapacityBoard } from '../../../components/capacity/HospitalCapacityBoard';
import { useQuery } from '@tanstack/react-query';
import { medicalApi } from '../../../lib/apiClient';
import { BLOOD_TYPE_LABELS } from '../../../constants/theme';

export default function CapacityPage() {
  const { hospitals, isLoading, refetch } = useHospitalCapacity();
  const { data: blood = [] } = useQuery({
    queryKey: ['blood-bank'],
    queryFn: () => medicalApi.getBloodBank().then(r => r.data.data ?? []),
    refetchInterval: 60000,
  });

  const critical = blood.filter((b: any) => b.status === 'CRITICAL');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Hospital Capacity Board</h1>
        <button onClick={() => refetch()} className="text-xs border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600">
          🔄 Refresh
        </button>
      </div>

      {/* Critical blood alerts */}
      {critical.map((b: any) => (
        <div key={b.type} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          🩸 <strong>{BLOOD_TYPE_LABELS[b.type] ?? b.type}</strong> blood type critically low across all hospitals ({b.units} unit{b.units !== 1 ? 's' : ''}). Consider urgent procurement.
        </div>
      ))}

      {/* Blood bank summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Blood Bank Summary (All Hospitals)</h2>
        <div className="grid grid-cols-4 gap-3">
          {blood.map((b: any) => {
            const color = b.status === 'CRITICAL' ? '#EF4444' : b.status === 'LOW' ? '#F59E0B' : '#22C55E';
            const icon = b.status === 'CRITICAL' ? '❌' : b.status === 'LOW' ? '⚠️' : '✅';
            return (
              <div key={b.type} className="text-center p-3 rounded-lg border" style={{ borderColor: color + '30' }}>
                <div className="text-lg mb-1">{icon}</div>
                <div className="text-sm font-bold" style={{ color }}>{BLOOD_TYPE_LABELS[b.type] ?? b.type}</div>
                <div className="text-xs text-gray-500">{b.units} units</div>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading hospitals...</div>
      ) : (
        <HospitalCapacityBoard hospitals={hospitals} onRefresh={refetch} />
      )}
    </div>
  );
}
