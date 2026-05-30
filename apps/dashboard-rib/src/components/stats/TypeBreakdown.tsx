'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { INCIDENT_TYPES } from '../../constants/theme';

const COLORS = ['#1B5E82','#D32F2F','#F57C00','#388E3C','#7B1FA2','#0288D1','#F9A825','#5D4037','#455A64'];

export function TypeBreakdown({ data, onSelect }: { data: Record<string, number>; onSelect?: (type: string) => void }) {
  const chartData = Object.entries(data || {}).map(([type, count], i) => ({
    name: INCIDENT_TYPES.find(t => t.key === type)?.label ?? type,
    value: count,
    color: COLORS[i % COLORS.length],
    key: type,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">By Type</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
            dataKey="value" onClick={(d: any) => onSelect?.(d.key)}>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [v, n]} />
          <Legend iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
