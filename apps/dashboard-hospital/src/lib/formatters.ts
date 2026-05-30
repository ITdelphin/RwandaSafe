export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export function elapsedMinutes(date: string | Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-RW', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-RW', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function toCSV(data: Record<string, any>[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const v = row[h] ?? '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(data: Record<string, any>[], filename: string) {
  const csv = toCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
