'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { investigationApi, patternApi, tiplineApi } from '../../lib/apiClient';
import { StatCard } from '../../components/stats/StatCard';
import { InvestigationCard } from '../../components/investigations/InvestigationCard';
import { PatternAlertBanner } from '../../components/investigations/PatternAlertBanner';
import { INVESTIGATION_STATUS_COLORS } from '../../constants/theme';
import { EmptyState } from '../../components/shared/EmptyState';

export default function DashboardPage() {
  const qc = useQueryClient();

  const { data: investigationsData } = useQuery({
    queryKey: ['investigations', 'recent'],
    queryFn: () => investigationApi.list({ limit: 8, sort: 'updatedAt:desc' }).then((r: any) => r.data?.data),
    refetchInterval: 60000,
  });

  const { data: patternData } = useQuery({
    queryKey: ['pattern-alerts'],
    queryFn: () => patternApi.getAlerts().then((r: any) => r.data?.data),
    refetchInterval: 60000,
  });

  const { data: unreviewedTipsData } = useQuery({
    queryKey: ['tips', 'unreviewed'],
    queryFn: () => tiplineApi.list({ isReviewed: false, limit: 1 }).then((r: any) => r.data?.data),
    refetchInterval: 60000,
  });

  const investigations = Array.isArray(investigationsData) ? investigationsData : investigationsData?.data ?? [];
  const patterns = Array.isArray(patternData) ? patternData : patternData?.data ?? [];
  const unreviewedTips = unreviewedTipsData?.total ?? unreviewedTipsData?.count ?? (Array.isArray(unreviewedTipsData) ? unreviewedTipsData.length : 0);

  const openInvestigations = investigations.filter((i: any) => i.status === 'OPEN').length;
  const activeInvestigations = investigations.filter((i: any) => i.status === 'ACTIVE').length;
  const closedThisMonth = investigations.filter((i: any) =>
    ['CLOSED_SOLVED', 'CLOSED_UNSOLVED'].includes(i.status) &&
    new Date(i.closedAt ?? i.updatedAt).getMonth() === new Date().getMonth()
  ).length;
  const newPatterns = patterns.filter((p: any) => !p.isReviewed).length;

  const handleDismissPattern = async (patternId: string) => {
    try {
      await patternApi.review(patternId, { isReviewed: true, action: 'DISMISS' });
      qc.invalidateQueries({ queryKey: ['pattern-alerts'] });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {newPatterns > 0 && <PatternAlertBanner patternCount={newPatterns} />}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Open Investigations" value={openInvestigations} color="#3B82F6" icon="📂" />
        <StatCard label="Active Investigations" value={activeInvestigations} color="#8B5CF6" icon="🔎" />
        <StatCard label="Unreviewed Tips" value={unreviewedTips} color="#F59E0B" icon="💬" />
        <StatCard label="Pattern Alerts" value={newPatterns} color="#EF4444" icon="📡" />
        <StatCard label="Closed This Month" value={closedThisMonth} color="#22C55E" icon="✅" />
      </div>

      {/* Recent Investigations + Pattern Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Investigations */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Recent Investigations</h2>
            <Link href="/dashboard/investigations" className="text-xs text-purple-600 hover:underline">View All →</Link>
          </div>
          {investigations.length === 0 ? (
            <EmptyState message="No investigations yet" icon="🔍" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {investigations.slice(0, 8).map((inv: any) => (
                <InvestigationCard key={inv.id} investigation={inv} />
              ))}
            </div>
          )}
        </div>

        {/* Pattern Alerts */}
        <div className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
            <h2 className="font-semibold text-gray-800 text-sm">Pattern Alerts</h2>
            <Link href="/dashboard/patterns" className="text-xs text-purple-600 hover:underline">All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {patterns.length === 0 ? (
              <EmptyState message="No pattern alerts" icon="📡" />
            ) : (
              patterns.slice(0, 6).map((p: any) => (
                <div key={p.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="text-xs font-semibold text-gray-800">{p.type?.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-gray-500">{p.district} · {p.incidentCount ?? p.count ?? 0} incidents</div>
                    </div>
                    {!p.isReviewed && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-400 mt-1" />
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/dashboard/investigations/new?patternId=${p.id}`}
                      className="text-xs text-purple-600 hover:underline font-medium"
                    >
                      Open Case
                    </Link>
                    {!p.isReviewed && (
                      <button
                        onClick={() => handleDismissPattern(p.id)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
