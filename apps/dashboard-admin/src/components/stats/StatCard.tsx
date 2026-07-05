interface Props {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}

export function StatCard({ label, value, color, icon }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: color + '15' }}>
        <span>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold" style={{ color: '#202124' }}>{value}</div>
        <div className="text-xs" style={{ color: '#5f6368' }}>{label}</div>
      </div>
    </div>
  );
}
