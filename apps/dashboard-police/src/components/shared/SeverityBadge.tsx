import { SEVERITY_COLORS } from '../../constants/theme';

export function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_COLORS[severity] ?? '#757575';
  return (
    <span style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase">
      {severity}
    </span>
  );
}
