import { TRIAGE_COLORS } from '../../constants/theme';

export function TriageBadge({ level }: { level: string }) {
  const color = TRIAGE_COLORS[level] ?? '#757575';
  const textColor = level === 'DELAYED' ? '#333' : '#fff';
  return (
    <span style={{ backgroundColor: color, color: textColor }}
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase">
      {level}
    </span>
  );
}
