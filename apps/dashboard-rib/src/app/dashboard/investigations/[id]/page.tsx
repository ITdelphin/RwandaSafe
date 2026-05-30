'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { investigationApi, tiplineApi } from '../../../../lib/apiClient';
import { INVESTIGATION_STATUS_COLORS } from '../../../../constants/theme';
import { SuspectPanel } from '../../../../components/investigations/SuspectPanel';
import { EvidenceVault } from '../../../../components/investigations/EvidenceVault';
import { CaseTimeline } from '../../../../components/investigations/CaseTimeline';
import { LinkIncidentsModal } from '../../../../components/investigations/LinkIncidentsModal';
import { TipReviewPanel } from '../../../../components/tipline/TipReviewPanel';
import { formatDate } from '../../../../lib/formatters';

type Tab = 'overview' | 'suspects' | 'evidence' | 'timeline' | 'tips' | 'export';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview',  label: 'Overview' },
  { key: 'suspects',  label: 'Suspects' },
  { key: 'evidence',  label: 'Evidence' },
  { key: 'timeline',  label: 'Timeline' },
  { key: 'tips',      label: 'Tips' },
  { key: 'export',    label: 'Export' },
];

export default function InvestigationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data: investigation, isLoading, error } = useQuery({
    queryKey: ['investigation', id],
    queryFn: () => investigationApi.getById(id).then((r: any) => r.data?.data),
    enabled: !!id,
  });

  const { data: tipsData } = useQuery({
    queryKey: ['investigation-tips', id],
    queryFn: () => tiplineApi.list({ investigationId: id, limit: 50 }).then((r: any) => r.data?.data),
    enabled: activeTab === 'tips' && !!id,
  });

  const tips = Array.isArray(tipsData) ? tipsData : tipsData?.data ?? [];

  const refetch = () => {
    qc.invalidateQueries({ queryKey: ['investigation', id] });
  };

  const handleReviewTip = async (tipId: string, data: any) => {
    await tiplineApi.review(tipId, data);
    qc.invalidateQueries({ queryKey: ['investigation-tips', id] });
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const res = await investigationApi.exportPdf(id) as any;
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `investigation-${investigation?.caseNumber ?? id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setStatusUpdating(true);
    try {
      await investigationApi.updateStatus(id, { status: newStatus });
      refetch();
      setNewStatus('');
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading investigation...</div>
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="text-4xl mb-3">🔍</div>
        <p>Investigation not found</p>
        <button onClick={() => router.back()} className="mt-3 text-xs text-purple-600 hover:underline">← Back</button>
      </div>
    );
  }

  const statusColor = INVESTIGATION_STATUS_COLORS[investigation.status] ?? '#6B7280';

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 mt-1">←</button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-lg font-bold text-purple-700">
              {investigation.caseNumber ?? investigation.id?.slice(0, 8)}
            </span>
            {investigation.isSensitive && <span>🔒</span>}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}40` }}
            >
              {investigation.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{investigation.title}</h1>
          {investigation.classification && (
            <p className="text-xs text-gray-500 mt-0.5">Classification: {investigation.classification}</p>
          )}
        </div>

        {/* Quick status update */}
        <div className="flex items-center gap-2">
          <select
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-purple-400 bg-white"
          >
            <option value="">Change Status...</option>
            <option value="OPEN">OPEN</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="CLOSED_SOLVED">CLOSED SOLVED</option>
            <option value="CLOSED_UNSOLVED">CLOSED UNSOLVED</option>
            <option value="REFERRED">REFERRED</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={!newStatus || statusUpdating}
            className="px-3 py-1.5 text-xs text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: '#4C1D95' }}
          >
            {statusUpdating ? '...' : 'Update'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <div className="bg-white border border-purple-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {investigation.description ?? 'No description provided.'}
              </p>
            </div>

            {/* Linked Incidents */}
            <div className="bg-white border border-purple-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Linked Incidents ({investigation.linkedIncidents?.length ?? investigation.incidentIds?.length ?? 0})
                </h3>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="text-xs text-purple-600 hover:underline"
                >
                  + Link Incident
                </button>
              </div>
              {(investigation.linkedIncidents?.length ?? 0) === 0 ? (
                <p className="text-xs text-gray-400">No incidents linked</p>
              ) : (
                <div className="space-y-2">
                  {(investigation.linkedIncidents ?? []).map((inc: any) => (
                    <div key={inc.id} className="flex items-center gap-3 text-xs p-2 bg-gray-50 rounded-lg">
                      <span className="font-mono text-purple-700 font-bold">{inc.trackingCode ?? inc.id?.slice(0, 8)}</span>
                      <span className="text-gray-500 truncate">{inc.description?.substring(0, 60)}</span>
                      <span className="text-gray-400 ml-auto">{inc.status?.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-4">
            <div className="bg-white border border-purple-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Case Details</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Lead Investigator</dt>
                  <dd className="font-medium text-gray-800">
                    {investigation.leadInvestigator?.user?.name ?? investigation.leadInvestigator?.name ?? '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Opened</dt>
                  <dd className="text-gray-700">{investigation.openedAt ? formatDate(investigation.openedAt) : '—'}</dd>
                </div>
                {investigation.closedAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Closed</dt>
                    <dd className="text-gray-700">{formatDate(investigation.closedAt)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Suspects</dt>
                  <dd className="font-medium text-gray-800">{investigation.suspects?.length ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Evidence</dt>
                  <dd className="font-medium text-gray-800">{investigation.evidence?.length ?? 0}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suspects' && (
        <SuspectPanel
          investigationId={id}
          suspects={investigation.suspects ?? []}
          onRefresh={refetch}
        />
      )}

      {activeTab === 'evidence' && (
        <EvidenceVault
          investigationId={id}
          evidence={investigation.evidence ?? []}
          onRefresh={refetch}
        />
      )}

      {activeTab === 'timeline' && (
        <CaseTimeline investigation={investigation} onRefresh={refetch} />
      )}

      {activeTab === 'tips' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Tips for this Investigation</h3>
            <span className="text-xs text-gray-400">{tips.length} tips</span>
          </div>
          <TipReviewPanel tips={tips} onReview={handleReviewTip} />
        </div>
      )}

      {activeTab === 'export' && (
        <div className="max-w-xl space-y-4">
          <div className="bg-white border border-purple-100 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Export Court-Ready Report</h3>
            <p className="text-sm text-gray-500 mb-5">
              Generate a comprehensive PDF report for court submission. The report includes:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-6 list-disc list-inside">
              <li>Case summary and classification</li>
              <li>Full investigation timeline</li>
              <li>Suspect profiles and status history</li>
              <li>Evidence log with chain of custody</li>
              <li>Linked incidents summary</li>
              <li>Investigator sign-off section</li>
            </ul>
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="w-full py-3 text-sm text-white font-semibold rounded-xl disabled:opacity-50"
              style={{ backgroundColor: '#4C1D95' }}
            >
              {exporting ? 'Generating PDF...' : '📄 Generate Court-Ready PDF'}
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800">
            <strong>Note:</strong> The exported PDF is classified. Handle in accordance with RIB data security protocols.
          </div>
        </div>
      )}

      {showLinkModal && (
        <LinkIncidentsModal
          investigationId={id}
          onClose={() => setShowLinkModal(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
