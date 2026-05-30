import { STATUS_COLORS } from '../../constants/theme';

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#5f6368';
  const label = status.replace(/_/g, ' ');
  return (
    <span style={{ backgroundColor: color + '18', color, border: `1px solid ${color}30` }}
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
      {label}
    </span>
  );
}
