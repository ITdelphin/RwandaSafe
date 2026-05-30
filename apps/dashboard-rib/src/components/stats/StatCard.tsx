interface Props {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
  sub?: string;
}

export function StatCard({ label, value, color = '#1a73e8', icon, sub }: Props) {
  const bgColor = color + '15'; // 15% opacity
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4"
      style={{ border: '1px solid #e8eaed', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {icon && (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: bgColor }}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="text-xs font-medium mt-0.5 truncate" style={{ color: '#5f6368' }}>{label}</div>
        {sub && <div className="text-[11px] mt-0.5" style={{ color: '#80868b' }}>{sub}</div>}
      </div>
    </div>
  );
}
