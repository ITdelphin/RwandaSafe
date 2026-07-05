import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: Props) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '10px 14px',
          border: `1.5px solid ${error ? '#d93025' : '#dadce0'}`,
          borderRadius: '10px',
          fontSize: '14px',
          outline: 'none',
          backgroundColor: '#f8f9fa',
          color: '#202124',
          boxSizing: 'border-box',
          transition: 'all 0.15s',
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? '#d93025' : '#1a73e8';
          e.target.style.backgroundColor = '#fff';
          e.target.style.boxShadow = error ? '0 0 0 3px rgba(217,48,37,0.1)' : '0 0 0 3px rgba(26,115,232,0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#d93025' : '#dadce0';
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <p style={{ fontSize: '12px', color: '#d93025', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}
