'use client';
import { useState } from 'react';
import { fireApi } from '../../lib/apiClient';
import { FIRE_TYPE_ICONS } from '../../constants/theme';

const FIRE_CAUSES = [
  'Electrical fault', 'Cooking fire', 'Arson', 'Lightning',
  'Equipment failure', 'Chemical reaction', 'Negligence', 'Unknown', 'Other',
];

const DAMAGE_LEVELS = ['MINOR', 'MODERATE', 'SEVERE', 'TOTAL_LOSS'];

interface Props {
  incidentId: string;
  fireReport?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PostIncidentReportModal({ incidentId, fireReport, onClose, onSuccess }: Props) {
  const [cause, setCause] = useState('');
  const [contained, setContained] = useState(true);
  const [injuries, setInjuries] = useState('0');
  const [fatalities, setFatalities] = useState('0');
  const [damageLevel, setDamageLevel] = useState('');
  const [narrative, setNarrative] = useState('');
  const [lessons, setLessons] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fireType = fireReport?.fireType ?? '';

  const handleSubmit = async () => {
    if (!cause || !damageLevel) { setError('Please fill all required fields'); return; }
    setError('');
    setSubmitting(true);
    try {
      await fireApi.submitPostReport(incidentId, {
        fireType,
        cause,
        contained,
        injuries: Number(injuries),
        fatalities: Number(fatalities),
        damageLevel,
        narrative,
        lessonsLearned: lessons,
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Post-Incident Report</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          {submitted ? (
            <div className="px-6 py-10 text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="font-semibold text-gray-800 mb-1">Report Submitted</div>
              <p className="text-sm text-gray-500 mb-6">Your post-incident report has been recorded.</p>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 text-sm text-white bg-orange-600 rounded-xl hover:bg-orange-700"
              >
                Download Report (Print)
              </button>
            </div>
          ) : (
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-4">
              {/* Fire type (auto-filled) */}
              {fireType && (
                <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs">
                  <span className="text-gray-500">Fire Type: </span>
                  <span className="font-semibold text-orange-800">
                    {FIRE_TYPE_ICONS[fireType]} {fireType.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cause of Fire <span className="text-red-500">*</span></label>
                <select
                  value={cause}
                  onChange={e => setCause(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                >
                  <option value="">Select cause...</option>
                  {FIRE_CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-gray-700">Fire was contained?</span>
                <button
                  onClick={() => setContained(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    contained ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${contained ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Injuries</label>
                  <input
                    type="number"
                    value={injuries}
                    onChange={e => setInjuries(e.target.value)}
                    min={0}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fatalities</label>
                  <input
                    type="number"
                    value={fatalities}
                    onChange={e => setFatalities(e.target.value)}
                    min={0}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Property Damage <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {DAMAGE_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => setDamageLevel(level)}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                        damageLevel === level
                          ? 'border-orange-500 bg-orange-100 text-orange-800 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {level.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Narrative</label>
                <textarea
                  value={narrative}
                  onChange={e => setNarrative(e.target.value)}
                  rows={3}
                  placeholder="Describe what happened..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lessons Learned</label>
                <textarea
                  value={lessons}
                  onChange={e => setLessons(e.target.value)}
                  rows={2}
                  placeholder="Key observations for future response..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-3 pb-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2 text-sm text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-50 font-semibold"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
