import { INCIDENT_TYPES } from '../../constants/theme';

export function TypeIcon({ type, showLabel = false }: { type: string; showLabel?: boolean }) {
  const found = INCIDENT_TYPES.find(t => t.key === type);
  return (
    <span className="flex items-center gap-1 text-sm">
      <span>{found?.icon ?? '❗'}</span>
      {showLabel && <span className="text-gray-600">{found?.label ?? type}</span>}
    </span>
  );
}
