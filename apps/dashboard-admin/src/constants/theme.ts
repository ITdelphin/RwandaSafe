export const Theme = {
  primary:          '#1a73e8',
  primaryDark:      '#1557b0',
  primaryLight:     '#4285F4',
  primarySurface:   '#e8f0fe',
  secondary:        '#34A853',
  secondaryDark:    '#1B8A3C',
  secondarySurface: '#e6f4ea',
  warning:          '#F9AB00',
  warningSurface:   '#fef9e3',
  danger:           '#d93025',
  dangerSurface:    '#fce8e6',
  sidebar:          '#ffffff',
  sidebarActive:    '#e8f0fe',
  background:       '#f8f9fa',
  surface:          '#ffffff',
  border:           '#dadce0',
  textPrimary:      '#202124',
  textSecondary:    '#5f6368',
};

export const AGENCY_ACCENT: Record<string, string> = {
  POLICE:   '#1a73e8',
  HOSPITAL: '#34A853',
  FIRE:     '#E8710A',
  RIB:      '#9334E6',
  ADMIN:    '#202124',
};

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#d93025',
  HIGH:     '#E8710A',
  MEDIUM:   '#1a73e8',
  LOW:      '#5f6368',
};

export const STATUS_COLORS: Record<string, string> = {
  RECEIVED:     '#5f6368',
  UNDER_REVIEW: '#1a73e8',
  ASSIGNED:     '#9334E6',
  DISPATCHED:   '#F9AB00',
  ON_SCENE:     '#d93025',
  RESOLVED:     '#34A853',
  CLOSED:       '#80868b',
  CANCELLED:    '#d93025',
};

export const INCIDENT_TYPES = [
  { key: 'ACCIDENT',          label: 'Accident',         icon: '🚗' },
  { key: 'MEDICAL_EMERGENCY', label: 'Medical Emergency',icon: '🏥' },
  { key: 'CRIME',             label: 'Crime',            icon: '🚨' },
  { key: 'FIRE',              label: 'Fire',             icon: '🔥' },
  { key: 'GBV',               label: 'GBV',              icon: '⚠️' },
  { key: 'CORRUPTION',        label: 'Corruption',       icon: '📋' },
  { key: 'MISSING_PERSON',    label: 'Missing Person',   icon: '🔍' },
  { key: 'NATURAL_DISASTER',  label: 'Natural Disaster', icon: '🌪️' },
  { key: 'OTHER',             label: 'Other',            icon: '❗' },
];
