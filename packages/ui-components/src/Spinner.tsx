interface Props {
  size?: number;
  color?: string;
}

export function Spinner({ size = 20, color = '#1a73e8' }: Props) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `2.5px solid ${color}25`,
        borderTopColor: color,
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'ui-spin 0.8s linear infinite',
      }}
    />
  );
}
