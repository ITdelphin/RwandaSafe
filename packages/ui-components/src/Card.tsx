import React from 'react';

interface Props {
  children: React.ReactNode;
  padding?: string;
  border?: boolean;
  shadow?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, padding = '20px', border = true, shadow = true, style, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding,
        border: border ? '1px solid #e8eaed' : 'none',
        boxShadow: shadow ? '0 1px 6px rgba(0,0,0,0.04)' : 'none',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'box-shadow 0.15s',
        ...style,
      }}
      onMouseEnter={(e) => { if (onClick) (e.target as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { if (onClick) (e.target as HTMLElement).style.boxShadow = shadow ? '0 1px 6px rgba(0,0,0,0.04)' : 'none'; }}
    >
      {children}
    </div>
  );
}
