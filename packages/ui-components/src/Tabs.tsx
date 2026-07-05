import React from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: string;
  count?: number;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e8eaed', marginBottom: '16px' }}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: isActive ? '2px solid #1a73e8' : '2px solid transparent',
              color: isActive ? '#1a73e8' : '#5f6368',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s',
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: isActive ? '#e8f0fe' : '#f1f3f4',
                color: isActive ? '#1a73e8' : '#5f6368',
                padding: '1px 7px',
                borderRadius: '999px',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
