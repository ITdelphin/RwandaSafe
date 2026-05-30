export const HospitalTheme = {
  sidebar:        '#1A0A0A',
  sidebarActive:  '#5C1A1A',
  topbar:         '#FFFFFF',
  background:     '#FFF5F5',
  surface:        '#FFFFFF',
  border:         '#FFE0E0',
  primary:        '#C62828',
  primaryHover:   '#B71C1C',
  triageImmediate: '#D32F2F',
  triageUrgent:    '#F57C00',
  triageDelayed:   '#FDD835',
  triageExpectant: '#212121',
  ambulanceAvailable:    '#22C55E',
  ambulanceDispatched:   '#F59E0B',
  ambulanceOnScene:      '#EF4444',
  ambulanceTransporting: '#8B5CF6',
  ambulanceAtHospital:   '#3B82F6',
  bedsGood:     '#22C55E',
  bedsWarning:  '#F59E0B',
  bedsCritical: '#EF4444',
  bedsEmpty:    '#94A3B8',
};

export const TRIAGE_COLORS: Record<string, string> = {
  IMMEDIATE: '#D32F2F',
  URGENT:    '#F57C00',
  DELAYED:   '#FDD835',
  EXPECTANT: '#212121',
};

export const AMBULANCE_COLORS: Record<string, string> = {
  AVAILABLE:    '#22C55E',
  DISPATCHED:   '#F59E0B',
  ON_SCENE:     '#EF4444',
  TRANSPORTING: '#8B5CF6',
  AT_HOSPITAL:  '#3B82F6',
  OFF_DUTY:     '#94A3B8',
  MAINTENANCE:  '#64748B',
};

export const AMBULANCE_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE:    ['DISPATCHED'],
  DISPATCHED:   ['ON_SCENE', 'AVAILABLE'],
  ON_SCENE:     ['TRANSPORTING', 'AVAILABLE'],
  TRANSPORTING: ['AT_HOSPITAL'],
  AT_HOSPITAL:  ['AVAILABLE'],
  OFF_DUTY:     ['AVAILABLE'],
  MAINTENANCE:  ['AVAILABLE'],
};

export const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
  UNKNOWN: '?',
};

export const SYMPTOM_OPTIONS = [
  'Chest Pain', 'Difficulty Breathing', 'Unconscious', 'Heavy Bleeding',
  'Fracture', 'Burns', 'Stroke Symptoms', 'Seizure', 'Allergic Reaction', 'Other',
];

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

// Compatibility exports (shared with police dashboard components)
export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#D32F2F', HIGH: '#F57C00', MEDIUM: '#1976D2', LOW: '#757575',
};

export const STATUS_COLORS: Record<string, string> = {
  RECEIVED: '#64748B', UNDER_REVIEW: '#3B82F6', ASSIGNED: '#8B5CF6',
  DISPATCHED: '#F59E0B', ON_SCENE: '#EF4444', RESOLVED: '#22C55E',
  CLOSED: '#94A3B8', CANCELLED: '#F43F5E',
};

export const RWANDA_DISTRICTS = [
  'Nyarugenge','Gasabo','Kicukiro','Nyanza','Gisagara','Nyaruguru',
  'Huye','Nyamagabe','Ruhango','Muhanga','Kamonyi','Karongi',
  'Rutsiro','Rubavu','Nyabihu','Ngororero','Rusizi','Nyamasheke',
  'Rulindo','Gakenke','Musanze','Burera','Gicumbi','Rwamagana',
  'Nyagatare','Gatsibo','Kayonza','Kirehe','Ngoma','Bugesera',
];

// Alias for components that still reference PoliceTheme
export const PoliceTheme = HospitalTheme;

