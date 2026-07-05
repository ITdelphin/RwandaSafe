import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Props {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
}

export function Table({ columns, data, onRowClick, emptyMessage = 'No data' }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#5f6368', fontSize: '14px' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e8eaed' }}>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 500, color: '#5f6368' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: '1px solid #f1f3f4',
                cursor: onRowClick ? 'pointer' : undefined,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '12px 16px', fontSize: '13px', color: '#202124' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
