import { SEVERITY_COLORS } from '../../constants/theme';

export function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_COLORS[severity] ?? '#5f6368';
  return (
    <span style={{ backgroundColor: color + '18', color, border: `1px solid ${color}30` }}
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase">
      {severity}
    </span>
  );
}
