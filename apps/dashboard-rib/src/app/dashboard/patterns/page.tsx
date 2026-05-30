'use client';
import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { patternApi, investigationApi } from '../../../lib/apiClient';
import { EmptyState } from '../../../components/shared/EmptyState';
import { formatDate } from '../../../lib/formatters';

export default function PatternsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  const [openCasePatternId, setOpenCasePatternId] = useState<string | null>(null);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [creatingCase, setCreatingCase] = useState(false);

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['pattern-alerts'],
    queryFn: () => patternApi.getAlerts().then((r: any) => r.data?.data),
    refetchInterval: 60000,
  });

  const alerts = Array.isArray(alertsData) ? alertsData : alertsData?.data ?? [];
  const unreviewed = alerts.filter((a: any) => !a.isReviewed);
  const reviewed = alerts.filter((a: any) => a.isReviewed);

  const handleRunDetection = async () => {
    setRunning(true);
    setRunSuccess(false);
    try {
      await patternApi.run();
      setRunSuccess(true);
      qc.invalidateQueries({ queryKey: ['pattern-alerts'] });
      setTimeout(() => setRunSuccess(false), 3000);
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Pattern detection failed');
    } finally {
      setRunning(false);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await patternApi.review(alertId, { isReviewed: true, action: 'DISMISS' });
      qc.invalidateQueries({ queryKey: ['pattern-alerts'] });
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Failed to dismiss');
    }
  };

  const handleOpenInvestigation = async (alert: any) => {
    const title = newCaseTitle || `Pattern: ${alert.type?.replace(/_/g, ' ')} — ${alert.district}`;
    setCreatingCase(true);
    try {
      const res: any = await investigationApi.create({
        title,
        description: `Automatically created from pattern alert. Type: ${alert.type}, District: ${alert.district}, Incidents: ${alert.incidentCount ?? alert.count ?? 0}`,
        incidentIds: alert.incidentIds ?? [],
      });
      await patternApi.review(alert.id, { isReviewed: true, action: 'OPEN_INVESTIGATION' });
      qc.invalidateQueries({ queryKey: ['pattern-alerts'] });
      qc.invalidateQueries({ queryKey: ['investigations'] });
      const newId = res.data?.data?.id;
      if (newId) router.push(`/dashboard/investigations/${newId}`);
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Failed to open investigation');
    } finally {
      setCreatingCase(false);
      setOpenCasePatternId(null);
      setNewCaseTitle('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Pattern Detection</h1>
          <p className="text-xs text-gray-500 mt-0.5">AI-powered crime pattern analysis across incident reports</p>
        </div>
        <button
          onClick={handleRunDetection}
          disabled={running}
          className="px-4 py-2 text-sm text-white rounded-xl font-semibold disabled:opacity-50"
          style={{ backgroundColor: '#4C1D95' }}
        >
          {running ? '⏳ Running...' : '▶ Run Pattern Detection'}
        </button>
      </div>

      {runSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          ✅ Pattern detection completed. New alerts have been generated.
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-purple-900 mb-1">How Pattern Detection Works</h3>
        <p className="text-xs text-purple-700 leading-relaxed">
          The system analyzes incident reports across districts and time periods to identify unusual clusters of similar crimes.
          When 3 or more related incidents are detected within 48 hours in the same area, an alert is generated.
          Patterns can indicate organized crime, systemic issues, or emerging threats requiring investigation.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading alerts...</div>
      ) : (
        <>
          {/* Unreviewed Alerts */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Active Alerts</h2>
              {unreviewed.length > 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreviewed.length} new
                </span>
              )}
            </div>

            {unreviewed.length === 0 ? (
              <EmptyState message="No active pattern alerts" icon="📡" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unreviewed.map((alert: any) => (
                  <div key={alert.id} className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {alert.type?.replace(/_/g, ' ') ?? 'Unknown Pattern'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          📍 {alert.district ?? 'Multiple districts'} · {alert.incidentCount ?? alert.count ?? 0} incidents
                        </div>
                      </div>
                      <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-red-500 mt-1" />
                    </div>

                    {alert.incidentIds?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Related Incidents:</div>
                        <div className="flex flex-wrap gap-1">
                          {alert.incidentIds.slice(0, 4).map((iid: string) => (
                            <span key={iid} className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {iid.slice(0, 8)}
                            </span>
                          ))}
                          {alert.incidentIds.length > 4 && (
                            <span className="text-xs text-gray-400">+{alert.incidentIds.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mb-3">
                      Detected: {alert.createdAt ? formatDate(alert.createdAt) : '—'}
                    </div>

                    {openCasePatternId === alert.id ? (
                      <div className="space-y-2">
                        <input
                          value={newCaseTitle}
                          onChange={e => setNewCaseTitle(e.target.value)}
                          placeholder={`Pattern: ${alert.type?.replace(/_/g, ' ')} — ${alert.district}`}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-purple-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenInvestigation(alert)}
                            disabled={creatingCase}
                            className="text-xs px-3 py-1.5 text-white rounded-lg font-medium disabled:opacity-50"
                            style={{ backgroundColor: '#4C1D95' }}
                          >
                            {creatingCase ? 'Creating...' : 'Create & Open'}
                          </button>
                          <button
                            onClick={() => { setOpenCasePatternId(null); setNewCaseTitle(''); }}
                            className="text-xs px-3 py-1.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOpenCasePatternId(alert.id)}
                          className="text-xs font-medium text-purple-700 hover:text-purple-900"
                        >
                          Open Investigation
                        </button>
                        <span className="text-gray-300">·</span>
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviewed Alerts */}
          {reviewed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Reviewed Alerts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewed.map((alert: any) => (
                  <div key={alert.id} className="bg-white border border-gray-100 rounded-xl p-4 opacity-60">
                    <div className="text-sm font-medium text-gray-700">
                      {alert.type?.replace(/_/g, ' ')} — {alert.district}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {alert.incidentCount ?? alert.count ?? 0} incidents · Action: {alert.action ?? 'Reviewed'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
