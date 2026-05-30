'use client';
import { useState } from 'react';
import { dashboardApi, investigationApi } from '../../lib/apiClient';

interface Props {
  investigationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function LinkIncidentsModal({ investigationId, onClose, onSuccess }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    try {
      const res: any = await dashboardApi.getIncidents({ search: query, agencyType: 'RIB', limit: 20 });
      const data = res.data?.data;
      setResults(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e: any) {
      setError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLink = async () => {
    if (selected.size === 0) return;
    setLinking(true);
    setError('');
    try {
      await investigationApi.linkIncidents(investigationId, { incidentIds: Array.from(selected) });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to link incidents');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Link Incidents</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by tracking code or description..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#4C1D95' }}
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {results.length > 0 && (
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-4 max-h-64 overflow-y-auto">
            {results.map((inc: any) => (
              <label
                key={inc.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(inc.id)}
                  onChange={() => toggleSelect(inc.id)}
                  className="accent-purple-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs font-bold text-purple-700">{inc.trackingCode}</div>
                  <div className="text-xs text-gray-500 truncate">{inc.description?.substring(0, 60)}</div>
                </div>
                <span className="text-xs text-gray-400">{inc.status?.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        )}

        {results.length === 0 && query && !searching && (
          <div className="text-center py-6 text-gray-400 text-sm mb-4">No incidents found</div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {selected.size > 0 ? `${selected.size} selected` : 'No incidents selected'}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleLink}
              disabled={linking || selected.size === 0}
              className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: '#4C1D95' }}
            >
              {linking ? 'Linking...' : 'Link Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
