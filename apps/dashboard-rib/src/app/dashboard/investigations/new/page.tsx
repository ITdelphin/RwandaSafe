'use client';
export const dynamic = 'force-dynamic';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewInvestigationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patternId = searchParams.get('patternId');

  useEffect(() => {
    // Redirect to investigations list which has the create modal
    const url = patternId
      ? `/dashboard/investigations?patternId=${patternId}&openCreate=1`
      : '/dashboard/investigations?openCreate=1';
    router.replace(url);
  }, [patternId, router]);

  return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Redirecting...
    </div>
  );
}
