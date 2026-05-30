import { STATUS_COLORS } from '../../constants/theme';

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#94A3B8';
  const label = status.replace(/_/g, ' ');
  return (
    <span style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
      {label}
    </span>
  );
}
