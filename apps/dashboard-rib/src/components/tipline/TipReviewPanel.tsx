'use client';
import { useState } from 'react';
import { formatDate } from '../../lib/formatters';

interface Props {
  tips: any[];
  onReview: (tipId: string, data: { isCredible: boolean }) => Promise<void>;
}

function maskPhone(phone: string): string {
  if (!phone) return 'Unknown';
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length < 6) return phone;
  return cleaned.slice(0, 7) + '***' + cleaned.slice(-3);
}

export function TipReviewPanel({ tips = [], onReview }: Props) {
  const [reviewing, setReviewing] = useState<string | null>(null);

  const handleReview = async (tipId: string, isCredible: boolean) => {
    setReviewing(tipId);
    try {
      await onReview(tipId, { isCredible });
    } finally {
      setReviewing(null);
    }
  };

  if (tips.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No tips to display</div>
    );
  }

  return (
    <div className="space-y-3">
      {tips.map((tip: any) => (
        <div key={tip.id} className="bg-white border border-purple-100 rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{tip.createdAt ? formatDate(tip.createdAt) : '—'}</span>
              {tip.isAnonymous ? (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">Anonymous</span>
              ) : (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                  {tip.phone ? maskPhone(tip.phone) : 'Known Caller'}
                </span>
              )}
            </div>
            {tip.isReviewed && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                tip.isCredible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {tip.isCredible ? '✅ Credible' : '❌ Not Credible'}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-800 mb-2 leading-relaxed">{tip.content ?? tip.message ?? '—'}</p>

          {tip.linkedCaseId && (
            <div className="text-xs text-purple-600 mb-2">
              Linked case: {tip.linkedCaseId}
            </div>
          )}

          {!tip.isReviewed && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleReview(tip.id, true)}
                disabled={reviewing === tip.id}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                ✅ Credible
              </button>
              <button
                onClick={() => handleReview(tip.id, false)}
                disabled={reviewing === tip.id}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                ❌ Not Credible
              </button>
              {reviewing === tip.id && <span className="text-xs text-gray-400 self-center">Saving...</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
