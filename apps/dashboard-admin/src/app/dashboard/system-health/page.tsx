'use client';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { StatCard } from '../../../components/stats/StatCard';
import { EmptyState } from '../../../components/shared/EmptyState';

export default function SystemHealthPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: () => adminApi.getSystemHealth().then((r: any) => r.data.data),
    refetchInterval: 15000,
  });

  const services = data?.services ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-800">System Health</h1>

      {isLoading ? (
        <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
      ) : !data ? (
        <EmptyState message="System health data unavailable" icon="⚡" />
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Uptime" value={data.uptime != null ? `${data.uptime}h` : '—'} color="#22C55E" icon="⏱️" />
            <StatCard label="CPU Usage" value={data.cpu != null ? `${data.cpu}%` : '—'} color={data.cpu > 80 ? '#d93025' : '#1a73e8'} icon="💻" />
            <StatCard label="Memory" value={data.memory != null ? `${data.memory}%` : '—'} color={data.memory > 80 ? '#d93025' : '#34A853'} icon="🧠" />
            <StatCard label="API Latency" value={data.latency != null ? `${data.latency}ms` : '—'} color={data.latency > 500 ? '#d93025' : '#F9AB00'} icon="📡" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm">Services Status</h2>
            </div>
            {services.length === 0 ? (
              <EmptyState message="No services monitored" icon="⚡" />
            ) : (
              <div className="divide-y divide-gray-50">
                {services.map((svc: any) => (
                  <div key={svc.name} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{
                        backgroundColor: svc.status === 'UP' ? '#22C55E' : svc.status === 'DEGRADED' ? '#F9AB00' : '#EF4444',
                      }} />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{svc.name}</div>
                        <div className="text-xs text-gray-500">{svc.host ?? ''}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium" style={{
                        color: svc.status === 'UP' ? '#1B8A3C' : svc.status === 'DEGRADED' ? '#E8710A' : '#d93025',
                      }}>
                        {svc.status}
                      </div>
                      <div className="text-[10px] text-gray-400">{svc.responseTime ?? ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
