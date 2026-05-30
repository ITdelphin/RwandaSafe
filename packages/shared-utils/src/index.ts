export function formatTrackingCode(code: string): string {
  return code.toUpperCase();
}

export function formatPhoneDisplay(phone: string): string {
  // +250788123456 → 0788 123 456
  if (phone.startsWith('+250')) {
    const local = phone.slice(4);
    return `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone;
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#ea580c',
    MEDIUM: '#ca8a04',
    LOW: '#6b7280',
  };
  return map[severity] ?? '#6b7280';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    RECEIVED: 'Received',
    UNDER_REVIEW: 'Under Review',
    ASSIGNED: 'Assigned',
    DISPATCHED: 'Dispatched',
    ON_SCENE: 'On Scene',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
  };
  return map[status] ?? status;
}
