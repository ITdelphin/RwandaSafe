'use client';
import { SEVERITY_COLORS } from '../../constants/theme';
import { SeverityBadge } from '../shared/SeverityBadge';
import { StatusBadge } from '../shared/StatusBadge';
import { TypeIcon } from '../shared/TypeIcon';
import { SLATimer } from './SLATimer';
import { timeAgo } from '../../lib/formatters';

interface Props { incident: any; onClick: () => void; }

export function IncidentRow({ incident, onClick }: Props) {
  const borderColor = SEVERITY_COLORS[incident.severity] ?? '#757575';
  return (
    <tr onClick={onClick} className="hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0">
      <td className="py-3 pl-0 pr-3 w-1">
        <div className="w-1 h-10 rounded-full" style={{ backgroundColor: borderColor }} />
      </td>
      <td className="py-3 pr-4">
        <span className="font-mono text-xs font-bold text-blue-700">{incident.trackingCode}</span>
      </td>
      <td className="py-3 pr-4"><TypeIcon type={incident.type} showLabel /></td>
      <td className="py-3 pr-4 max-w-[200px]">
        <p className="text-xs text-gray-700 truncate">{incident.description?.substring(0, 80)}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{incident.district ?? '—'}</p>
      </td>
      <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">{timeAgo(incident.createdAt)}</td>
      <td className="py-3 pr-4"><StatusBadge status={incident.status} /></td>
      <td className="py-3 pr-4"><SLATimer createdAt={incident.createdAt} status={incident.status} compact /></td>
      <td className="py-3 pr-4 text-xs text-gray-500">
        {incident.assignments?.[0]?.officer?.user?.name ?? <span className="text-gray-300">Unassigned</span>}
      </td>
      <td className="py-3">
        <button className="text-xs text-blue-600 hover:underline font-medium">View</button>
      </td>
    </tr>
  );
}
