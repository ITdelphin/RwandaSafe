export const PoliceTheme = {
  sidebar:        '#0D1B2A',
  sidebarActive:  '#1B3A5C',
  topbar:         '#FFFFFF',
  background:     '#F0F4F8',
  surface:        '#FFFFFF',
  border:         '#E2E8F0',
  primary:        '#1B5E82',
  primaryHover:   '#154E6E',
  critical:       '#D32F2F',
  high:           '#F57C00',
  medium:         '#1976D2',
  low:            '#757575',
  statusReceived:   '#64748B',
  statusReview:     '#3B82F6',
  statusAssigned:   '#8B5CF6',
  statusDispatched: '#F59E0B',
  statusOnScene:    '#EF4444',
  statusResolved:   '#22C55E',
  statusClosed:     '#94A3B8',
  slaGreen:  '#22C55E',
  slaYellow: '#F59E0B',
  slaOrange: '#F97316',
  slaRed:    '#EF4444',
};

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#D32F2F',
  HIGH:     '#F57C00',
  MEDIUM:   '#1976D2',
  LOW:      '#757575',
};

export const STATUS_COLORS: Record<string, string> = {
  RECEIVED:     '#64748B',
  UNDER_REVIEW: '#3B82F6',
  ASSIGNED:     '#8B5CF6',
  DISPATCHED:   '#F59E0B',
  ON_SCENE:     '#EF4444',
  RESOLVED:     '#22C55E',
  CLOSED:       '#94A3B8',
  CANCELLED:    '#F43F5E',
};

export const INCIDENT_TYPES = [
  { key: 'ACCIDENT',          label: 'Accident',          icon: '🚗' },
  { key: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: '🏥' },
  { key: 'CRIME',             label: 'Crime',             icon: '🚨' },
  { key: 'FIRE',              label: 'Fire',              icon: '🔥' },
  { key: 'GBV',               label: 'GBV',               icon: '⚠️' },
  { key: 'CORRUPTION',        label: 'Corruption',        icon: '📋' },
  { key: 'MISSING_PERSON',    label: 'Missing Person',    icon: '🔍' },
  { key: 'NATURAL_DISASTER',  label: 'Natural Disaster',  icon: '🌪️' },
  { key: 'OTHER',             label: 'Other',             icon: '❗' },
];

export const RWANDA_DISTRICTS = [
  'Nyarugenge','Gasabo','Kicukiro','Nyanza','Gisagara','Nyaruguru',
  'Huye','Nyamagabe','Ruhango','Muhanga','Kamonyi','Karongi',
  'Rutsiro','Rubavu','Nyabihu','Ngororero','Rusizi','Nyamasheke',
  'Rulindo','Gakenke','Musanze','Burera','Gicumbi','Rwamagana',
  'Nyagatare','Gatsibo','Kayonza','Kirehe','Ngoma','Bugesera',
];

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  RECEIVED:     ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED:     ['DISPATCHED', 'CANCELLED'],
  DISPATCHED:   ['ON_SCENE'],
  ON_SCENE:     ['RESOLVED'],
  RESOLVED:     ['CLOSED'],
  CLOSED:       [],
  CANCELLED:    [],
};
