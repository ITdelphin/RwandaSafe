import React from 'react';
import { PackageOpen } from 'lucide-react';

export function EmptyState({ message = 'No data found', icon }: { message?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="mb-3">
        {icon ?? <PackageOpen size={48} />}
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
