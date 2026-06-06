import React from 'react';

export function EmptyState({ message = 'No data found', icon }: { message?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      {icon && <div className="mb-3">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  );
}
