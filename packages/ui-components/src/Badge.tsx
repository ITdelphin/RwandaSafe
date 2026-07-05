interface Props {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = '#1a73e8', bgColor, size = 'sm' }: Props) {
  const s = size === 'sm' ? { fontSize: '10px', padding: '2px 8px' } : { fontSize: '12px', padding: '4px 12px' };
  return (
    <span
      style={{
        display: 'inline-block',
        fontWeight: 700,
        borderRadius: '999px',
        color: color,
        backgroundColor: bgColor ?? color + '15',
        lineHeight: 1.4,
        ...s,
      }}
    >
      {label}
    </span>
  );
}
