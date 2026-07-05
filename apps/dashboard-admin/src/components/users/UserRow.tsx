'use client';
import { useState } from 'react';
import { adminApi } from '../../lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  user: any;
  onSelect?: (user: any) => void;
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: '#202124',
  POLICE_OFFICER: '#1a73e8',
  MEDICAL_RESPONDER: '#34A853',
  FIRE_OFFICER: '#E8710A',
  RIB_INVESTIGATOR: '#9334E6',
  CITIZEN: '#5f6368',
};

export function UserRow({ user, onSelect }: Props) {
  const qc = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async () => {
    if (!user.requestedRole) return;
    setActionLoading(true);
    try {
      await adminApi.approveRole(user.id, { role: user.requestedRole, agency: user.requestedAgency });
      qc.invalidateQueries({ queryKey: ['admin'] });
    } catch {}
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!user.requestedRole) return;
    setActionLoading(true);
    try {
      await adminApi.rejectRole(user.id);
      qc.invalidateQueries({ queryKey: ['admin'] });
    } catch {}
    setActionLoading(false);
  };

  const handleToggleActive = async () => {
    setActionLoading(true);
    try {
      if (user.isActive) await adminApi.suspendUser(user.id);
      else await adminApi.activateUser(user.id);
      qc.invalidateQueries({ queryKey: ['admin'] });
    } catch {}
    setActionLoading(false);
  };

  return (
    <tr className="hover:bg-gray-50 text-sm border-b border-gray-50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: ROLE_COLORS[user.role] ?? '#5f6368' }}>
            {user.name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800">{user.name ?? '—'}</div>
            <div className="text-[11px] text-gray-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
          backgroundColor: (ROLE_COLORS[user.role] ?? '#5f6368') + '15',
          color: ROLE_COLORS[user.role] ?? '#5f6368',
        }}>
          {user.role}
        </span>
        {user.requestedRole && (
          <div className="text-[10px] text-orange-600 mt-0.5">Pending: {user.requestedRole}</div>
        )}
      </td>
      <td className="px-5 py-3 text-gray-500 text-xs">{user.agency ?? '—'}</td>
      <td className="px-5 py-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
          backgroundColor: user.isActive ? '#e6f4ea' : '#fce8e6',
          color: user.isActive ? '#1B8A3C' : '#d93025',
        }}>
          {user.isActive ? 'Active' : 'Suspended'}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex gap-1">
          {user.requestedRole && (
            <>
              <button onClick={handleApprove} disabled={actionLoading}
                className="text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200">
                Approve
              </button>
              <button onClick={handleReject} disabled={actionLoading}
                className="text-[10px] font-bold px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200">
                Reject
              </button>
            </>
          )}
          <button onClick={handleToggleActive} disabled={actionLoading}
            className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
            {user.isActive ? 'Suspend' : 'Activate'}
          </button>
          {onSelect && (
            <button onClick={() => onSelect(user)}
              className="text-[10px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200">
              Edit
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
