interface Props {
  message: string;
  icon?: string;
}

export function EmptyState({ message, icon = '📭' }: Props) {
  return (
    <div className="py-10 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-sm" style={{ color: '#5f6368' }}>{message}</p>
    </div>
  );
}
