'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { officersApi } from '../../lib/apiClient';

interface Props { officer: any; compact?: boolean; }

const statusDot: Record<string, string> = {
  AVAILABLE: 'bg-green-500',
  BUSY: 'bg-yellow-400',
  OVERLOADED: 'bg-red-500',
};

export function OfficerCard({ officer, compact = false }: Props) {
  const qc = useQueryClient();
  const toggle = useMutation({
    mutationFn: () => officersApi.toggleDuty(officer.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-officers'] }),
  });

  const status = officer.status ?? 'AVAILABLE';
  const name = officer.user?.name ?? 'Officer';
  const initial = name.charAt(0).toUpperCase();
  const cases = officer.openCasesCount ?? 0;

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold">{initial}</div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusDot[status]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-800 truncate">{name}</div>
          <div className="text-[11px] text-gray-400">{officer.rank ?? 'Officer'} · {cases} case{cases !== 1 ? 's' : ''}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white text-lg font-bold">{initial}</div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusDot[status]}`} />
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{name}</div>
          <div className="text-xs text-gray-500">{officer.badgeNumber ? `#${officer.badgeNumber}` : '—'} · {officer.rank ?? 'Officer'}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-3">
        {cases === 0 ? '✅ Available' : `${cases} open case${cases !== 1 ? 's' : ''}`}
      </div>
      <button onClick={() => toggle.mutate()}
        className={`w-full text-xs py-1.5 rounded-lg font-medium border transition-colors ${officer.isOnDuty ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
        {officer.isOnDuty ? 'Go Off Duty' : 'Go On Duty'}
      </button>
    </div>
  );
}
