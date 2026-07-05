'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { StatCard } from '../../../components/stats/StatCard';
import { UserRow } from '../../../components/users/UserRow';
import { EmptyState } from '../../../components/shared/EmptyState';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter],
    queryFn: () => adminApi.getUsers({ search, role: roleFilter || undefined, limit: 100 }).then((r: any) => r.data.data),
  });

  const users = Array.isArray(data) ? data : data?.data ?? [];
  const pendingApprovals = users.filter((u: any) => u.requestedRole);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} color="#1a73e8" icon="👥" />
        <StatCard label="Pending Approvals" value={pendingApprovals.length} color="#E8710A" icon="⏳" />
        <StatCard label="Active" value={users.filter((u: any) => u.isActive).length} color="#34A853" icon="✅" />
        <StatCard label="Suspended" value={users.filter((u: any) => !u.isActive).length} color="#d93025" icon="🚫" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <input
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
          />
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="POLICE_OFFICER">Police</option>
            <option value="MEDICAL_RESPONDER">Medical</option>
            <option value="FIRE_OFFICER">Fire</option>
            <option value="RIB_INVESTIGATOR">RIB</option>
            <option value="CITIZEN">Citizen</option>
          </select>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : users.length === 0 ? (
          <EmptyState message="No users found" icon="👥" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-50">
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Agency</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => <UserRow key={u.id} user={u} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
