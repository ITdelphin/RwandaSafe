'use client';
import { DashboardFilters } from '../../hooks/useIncidentFeed';
import { RWANDA_DISTRICTS, INCIDENT_TYPES } from '../../constants/theme';

interface Props { filters: DashboardFilters; onChange: (f: DashboardFilters) => void; }

const STATUSES = ['RECEIVED','UNDER_REVIEW','ASSIGNED','DISPATCHED','ON_SCENE','RESOLVED','CLOSED','CANCELLED'];
const SEVERITIES = ['CRITICAL','HIGH','MEDIUM','LOW'];

export function IncidentFilters({ filters, onChange }: Props) {
  const set = (key: keyof DashboardFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  const reset = () => onChange({ agencyType: 'POLICE', limit: 20 });

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <select value={filters.status ?? ''} onChange={e => set('status', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
        <option value="">All Statuses</option>
        {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
      </select>

      <select value={filters.type ?? ''} onChange={e => set('type', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
        <option value="">All Types</option>
        {INCIDENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
      </select>

      <select value={filters.severity ?? ''} onChange={e => set('severity', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
        <option value="">All Severities</option>
        {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select value={filters.district ?? ''} onChange={e => set('district', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
        <option value="">All Districts</option>
        {RWANDA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <input type="date" value={filters.dateFrom ?? ''} onChange={e => set('dateFrom', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white" />

      <input type="date" value={filters.dateTo ?? ''} onChange={e => set('dateTo', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white" />

      <input value={filters.search ?? ''} onChange={e => set('search', e.target.value)}
        placeholder="Search..." className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white flex-1 min-w-[140px]" />

      <button onClick={reset} className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">Reset</button>
    </div>
  );
}
