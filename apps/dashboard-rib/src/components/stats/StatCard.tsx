interface Props {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
  sub?: string;
}

export function StatCard({ label, value, color = '#1B5E82', icon, sub }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
      {icon && (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: color + '15' }}>
          {icon}
        </div>
      )}
      <div>
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
