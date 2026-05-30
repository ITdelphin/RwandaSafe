'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tiplineApi } from '../../../lib/apiClient';
import { TipReviewPanel } from '../../../components/tipline/TipReviewPanel';

export default function TipsPage() {
  const qc = useQueryClient();

  const { data: allTipsData, isLoading } = useQuery({
    queryKey: ['tips', 'all'],
    queryFn: () => tiplineApi.list({ limit: 100 }).then((r: any) => r.data?.data),
    refetchInterval: 30000,
  });

  const allTips = Array.isArray(allTipsData) ? allTipsData : allTipsData?.data ?? [];
  const unreviewedTips = allTips.filter((t: any) => !t.isReviewed);
  const reviewedTips = allTips.filter((t: any) => t.isReviewed);

  const handleReview = async (tipId: string, data: { isCredible: boolean }) => {
    await tiplineApi.review(tipId, data);
    qc.invalidateQueries({ queryKey: ['tips'] });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Tipline</h1>
          <p className="text-xs text-gray-500 mt-0.5">Review anonymous tips and whistleblower submissions</p>
        </div>
        {unreviewedTips.length > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
            {unreviewedTips.length} unreviewed
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading tips...</div>
      ) : (
        <>
          {/* Unreviewed Tips */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Pending Review</h2>
              {unreviewedTips.length > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreviewedTips.length}
                </span>
              )}
            </div>
            <TipReviewPanel tips={unreviewedTips} onReview={handleReview} />
          </div>

          {/* Reviewed Tips */}
          {reviewedTips.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Reviewed Tips</h2>
              <TipReviewPanel tips={reviewedTips} onReview={handleReview} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
