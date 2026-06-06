'use client';
import { useRouter } from 'next/navigation';
import { User, FolderOpen, Link2, Lock } from 'lucide-react';
import { INVESTIGATION_STATUS_COLORS } from '../../constants/theme';
import { timeAgo } from '../../lib/formatters';

interface Props {
  investigation: any;
}

export function InvestigationCard({ investigation }: Props) {
  const router = useRouter();
  const statusColor = INVESTIGATION_STATUS_COLORS[investigation.status] ?? '#6B7280';

  return (
    <div
      onClick={() => router.push(`/dashboard/investigations/${investigation.id}`)}
      className="bg-white rounded-xl border border-purple-100 shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-purple-700">
            {investigation.caseNumber ?? investigation.id?.slice(0, 8)}
          </span>
          {investigation.isSensitive && (
            <span className="text-gray-400" title="Sensitive case"><Lock size={12} /></span>
          )}
        </div>
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}40` }}
        >
          {investigation.status?.replace(/_/g, ' ') ?? 'UNKNOWN'}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
        {investigation.title ?? 'Untitled Investigation'}
      </h3>

      <div className="text-xs text-gray-500 mb-3">
        Lead: {investigation.leadInvestigator?.user?.name ?? investigation.leadInvestigator?.name ?? 'Unassigned'}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
        <span className="flex items-center gap-1" title="Suspects">
          <User size={12} /> {investigation.suspects?.length ?? 0}
        </span>
        <span className="flex items-center gap-1" title="Evidence">
          <FolderOpen size={12} /> {investigation.evidence?.length ?? 0}
        </span>
        <span className="flex items-center gap-1" title="Linked incidents">
          <Link2 size={12} /> {investigation.linkedIncidents?.length ?? investigation.incidentIds?.length ?? 0}
        </span>
        <span className="ml-auto text-gray-400">
          {investigation.openedAt ? timeAgo(investigation.openedAt) : timeAgo(investigation.createdAt)}
        </span>
      </div>

      {investigation.updatedAt && (
        <div className="text-[11px] text-gray-400 mt-1">
          Updated {timeAgo(investigation.updatedAt)}
        </div>
      )}
    </div>
  );
}
