import React from 'react';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, style, ...props }: Props) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '1.5px solid #dadce0',
          borderRadius: '10px',
          fontSize: '14px',
          outline: 'none',
          backgroundColor: '#f8f9fa',
          color: '#202124',
          cursor: 'pointer',
          boxSizing: 'border-box',
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = '#1a73e8'; e.target.style.backgroundColor = '#fff'; }}
        onBlur={(e) => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
