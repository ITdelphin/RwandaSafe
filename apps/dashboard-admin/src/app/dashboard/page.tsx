'use client';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { StatCard } from '../../components/stats/StatCard';
import { EmptyState } from '../../components/shared/EmptyState';
import Link from 'next/link';

const AGENCY_COLORS: Record<string, string> = {
  POLICE: '#1a73e8',
  HOSPITAL: '#34A853',
  FIRE: '#E8710A',
  RIB: '#9334E6',
};

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then((r: any) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['admin', 'pending-approvals'],
    queryFn: () => adminApi.getPendingApprovals().then((r: any) => r.data.data),
    refetchInterval: 15000,
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: () => adminApi.getSystemHealth().then((r: any) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: recentUsers } = useQuery({
    queryKey: ['admin', 'recent-users'],
    queryFn: () => adminApi.getUsers({ limit: 5, sort: 'createdAt:desc' }).then((r: any) => r.data.data),
  });

  const users = Array.isArray(recentUsers) ? recentUsers : recentUsers?.data ?? [];
  const pending = Array.isArray(pendingApprovals) ? pendingApprovals : pendingApprovals?.data ?? [];
  const agencies = stats?.agencies ?? [];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} color="#1a73e8" icon="👥" />
        <StatCard label="Active Agencies" value={stats?.activeAgencies ?? '—'} color="#34A853" icon="🏛️" />
        <StatCard label="Pending Approvals" value={pending.length} color="#E8710A" icon="⏳" />
        <StatCard label="Total Incidents" value={stats?.totalIncidents ?? '—'} color="#9334E6" icon="📊" />
        <StatCard label="System Uptime" value={systemHealth?.uptime != null ? `${systemHealth.uptime}h` : '—'} color="#22C55E" icon="⚡" />
      </div>

      {/* Pending Approvals + Agency Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Pending Role Approvals</h2>
            <Link href="/dashboard/users" className="text-xs text-blue-600 hover:underline">Manage Users →</Link>
          </div>
          {pending.length === 0 ? (
            <EmptyState message="No pending approvals" icon="✅" />
          ) : (
            <div className="divide-y divide-gray-50">
              {pending.slice(0, 10).map((user: any) => (
                <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: AGENCY_COLORS[user.requestedAgency] ?? '#5f6368' }}>
                    {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{user.name ?? 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{user.email} · Requested: {user.requestedAgency}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agency Status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Agency Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {agencies.length === 0 ? (
              <EmptyState message="No agencies configured" icon="🏛️" />
            ) : (
              agencies.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: (AGENCY_COLORS[a.type] ?? '#5f6368') + '08' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.isActive ? '#22C55E' : '#EF4444' }} />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{a.name}</div>
                      <div className="text-xs text-gray-500">{a.type} · {a.officerCount ?? 0} officers</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                    backgroundColor: a.isActive ? '#e6f4ea' : '#fce8e6',
                    color: a.isActive ? '#1B8A3C' : '#d93025',
                  }}>
                    {a.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Recent Registrations</h2>
          <Link href="/dashboard/users" className="text-xs text-blue-600 hover:underline">All Users →</Link>
        </div>
        {users.length === 0 ? (
          <EmptyState message="No recent users" icon="👥" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Agency</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 text-sm border-b border-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{u.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{u.agency ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: u.isActive ? '#e6f4ea' : '#fce8e6',
                          color: u.isActive ? '#1B8A3C' : '#d93025',
                        }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-right">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
