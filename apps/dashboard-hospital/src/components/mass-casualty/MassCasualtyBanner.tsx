'use client';

interface Props { event: any; onResolve?: () => void; }

export function MassCasualtyBanner({ event, onResolve }: Props) {
  if (!event?.isActive) return null;
  return (
    <div className="w-full bg-red-600 text-white px-6 py-3 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <span className="font-bold text-sm">MASS CASUALTY EVENT ACTIVE</span>
          <span className="mx-2">—</span>
          <span className="text-sm">{event.title}</span>
          <span className="mx-2">—</span>
          <span className="text-sm">{event.location}</span>
          <span className="ml-2 text-sm">· Est. {event.estimatedCount} victims</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium">View Details</button>
        {onResolve && (
          <button onClick={onResolve} className="text-xs bg-white text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium">Resolve Event</button>
        )}
      </div>
    </div>
  );
}
