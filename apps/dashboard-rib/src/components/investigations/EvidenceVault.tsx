'use client';
import { useState } from 'react';
import { investigationApi } from '../../lib/apiClient';
import { EVIDENCE_TYPE_ICONS } from '../../constants/theme';
import { formatDate } from '../../lib/formatters';

interface Props {
  investigationId: string;
  evidence: any[];
  onRefresh: () => void;
}

const EVIDENCE_TYPES = ['PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO', 'PHYSICAL_DESCRIPTION', 'WITNESS_STATEMENT', 'OTHER'];

export function EvidenceVault({ investigationId, evidence = [], onRefresh }: Props) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [expandedChain, setExpandedChain] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'PHOTO',
    file: null as File | null,
  });

  const handleView = async (evidenceId: string) => {
    setViewingId(evidenceId);
    try {
      const res: any = await investigationApi.getEvidenceUrl(evidenceId);
      const url = res.data?.data?.url ?? res.data?.url;
      if (url) window.open(url, '_blank');
      else alert('Could not retrieve evidence URL');
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Failed to get evidence URL');
    } finally {
      setViewingId(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) { setUploadError('Please select a file'); return; }
    if (!uploadForm.title.trim()) { setUploadError('Title is required'); return; }
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('type', uploadForm.type);
      await investigationApi.uploadEvidence(investigationId, formData);
      setUploadForm({ title: '', description: '', type: 'PHOTO', file: null });
      setShowUpload(false);
      onRefresh();
    } catch (e: any) {
      setUploadError(e.response?.data?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Evidence Grid */}
      {evidence.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No evidence uploaded yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evidence.map((item: any) => {
            const icon = EVIDENCE_TYPE_ICONS[item.type] ?? '📦';
            const isExpanded = expandedChain === item.id;
            return (
              <div key={item.id} className="bg-white border border-purple-100 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-xl">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.type?.replace(/_/g, ' ')} · {item.createdAt ? formatDate(item.createdAt) : '—'}</div>
                  </div>
                  {item.isAdmissible !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.isAdmissible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {item.isAdmissible ? 'Admissible' : 'Not Admissible'}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(item.id)}
                    disabled={viewingId === item.id}
                    className="flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-900 disabled:opacity-50"
                  >
                    🔒 {viewingId === item.id ? 'Loading...' : 'View'}
                  </button>
                  {item.chainOfCustody && (
                    <button
                      onClick={() => setExpandedChain(isExpanded ? null : item.id)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? '▲' : '▼'} Chain of Custody
                    </button>
                  )}
                </div>
                {isExpanded && item.chainOfCustody && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-2 text-xs font-mono text-gray-600 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                      {typeof item.chainOfCustody === 'string'
                        ? item.chainOfCustody
                        : JSON.stringify(item.chainOfCustody, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Form */}
      {showUpload ? (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-purple-900 mb-3">Upload Evidence</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                value={uploadForm.title}
                onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                placeholder="Evidence title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={uploadForm.type}
                onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
              >
                {EVIDENCE_TYPES.map(t => (
                  <option key={t} value={t}>{EVIDENCE_TYPE_ICONS[t]} {t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={uploadForm.description}
                onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 resize-none"
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">File <span className="text-red-500">*</span></label>
              <input
                type="file"
                onChange={e => setUploadForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))}
                className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
            </div>
          </div>
          {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 text-xs text-white rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: '#4C1D95' }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={() => { setShowUpload(false); setUploadError(''); }}
              className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowUpload(true)}
          className="w-full py-2.5 text-xs font-medium text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
        >
          + Upload Evidence
        </button>
      )}
    </div>
  );
}
