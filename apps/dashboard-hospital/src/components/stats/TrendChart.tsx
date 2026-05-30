'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendPoint { date: string; total: number; critical?: number; resolved?: number; }

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Incident Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend iconSize={10} />
          <Line type="monotone" dataKey="total" stroke="#1B5E82" strokeWidth={2} dot={false} name="Total" />
          <Line type="monotone" dataKey="critical" stroke="#D32F2F" strokeWidth={2} dot={false} name="Critical" />
          <Line type="monotone" dataKey="resolved" stroke="#22C55E" strokeWidth={2} dot={false} name="Resolved" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
