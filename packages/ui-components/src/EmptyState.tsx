interface Props {
  message: string;
  icon?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ message, icon = '📭', action }: Props) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 16px' }}>{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#1a73e8',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
