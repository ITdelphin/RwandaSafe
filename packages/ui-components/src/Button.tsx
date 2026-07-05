import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
}

const VARIANT_STYLES = {
  primary:   { bg: '#1a73e8', color: '#fff', hover: '#1557b0' },
  secondary: { bg: '#e8eaed', color: '#202124', hover: '#dadce0' },
  danger:    { bg: '#d93025', color: '#fff', hover: '#b3261e' },
  ghost:     { bg: 'transparent', color: '#1a73e8', hover: '#e8f0fe' },
};

const SIZE_STYLES = {
  sm: { padding: '6px 12px', fontSize: '12px' },
  md: { padding: '10px 16px', fontSize: '14px' },
  lg: { padding: '14px 24px', fontSize: '16px' },
};

export function Button({ variant = 'primary', size = 'md', loading, icon, children, disabled, style, ...props }: Props) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        borderRadius: '10px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'all 0.15s',
        backgroundColor: v.bg,
        color: v.color,
        ...s,
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled && !loading) (e.target as HTMLElement).style.backgroundColor = v.hover; }}
      onMouseLeave={(e) => { if (!disabled && !loading) (e.target as HTMLElement).style.backgroundColor = v.bg; }}
      {...props}
    >
      {loading ? (
        <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'ui-spin 0.8s linear infinite' }} />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
      <style>{`@keyframes ui-spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
