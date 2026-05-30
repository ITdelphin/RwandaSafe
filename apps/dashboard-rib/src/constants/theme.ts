// Shared Google Material palette — used across all Rwanda Safe dashboards
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

// Keep agency-specific accent for sidebar top border indicator
export const AGENCY_ACCENT: Record<string, string> = {
  POLICE:   '#1a73e8',  // Google Blue
  HOSPITAL: '#34A853',  // Bold Green
  FIRE:     '#E8710A',  // Google Orange
  RIB:      '#9334E6',  // Google Purple
};

// Severity — keep semantic colors, lighter versions
export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#d93025',
  HIGH:     '#E8710A',
  MEDIUM:   '#1a73e8',
  LOW:      '#5f6368',
};

// Status — Google Material colors
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

export const TRIAGE_COLORS: Record<string, string> = {
  IMMEDIATE: '#d93025',
  URGENT:    '#E8710A',
  DELAYED:   '#F9AB00',
  EXPECTANT: '#202124',
};

export const AMBULANCE_COLORS: Record<string, string> = {
  AVAILABLE:    '#34A853',
  DISPATCHED:   '#F9AB00',
  ON_SCENE:     '#d93025',
  TRANSPORTING: '#9334E6',
  AT_HOSPITAL:  '#1a73e8',
  OFF_DUTY:     '#80868b',
  MAINTENANCE:  '#5f6368',
};

export const UNIT_COLORS: Record<string, string> = {
  AVAILABLE:   '#34A853',
  RESPONDING:  '#F9AB00',
  ON_SCENE:    '#d93025',
  RETURNING:   '#9334E6',
  MAINTENANCE: '#5f6368',
  OFF_DUTY:    '#80868b',
};

export const INVESTIGATION_STATUS_COLORS: Record<string, string> = {
  OPEN:            '#1a73e8',
  ACTIVE:          '#9334E6',
  SUSPENDED:       '#5f6368',
  CLOSED_SOLVED:   '#34A853',
  CLOSED_UNSOLVED: '#d93025',
  REFERRED:        '#F9AB00',
};

export const SUSPECT_STATUS_COLORS: Record<string, string> = {
  PERSON_OF_INTEREST: '#F9AB00',
  SUSPECT:            '#d93025',
  CHARGED:            '#9334E6',
  ACQUITTED:          '#5f6368',
  CONVICTED:          '#202124',
};

export const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
  UNKNOWN: '?',
};

export const FIRE_TYPE_ICONS: Record<string, string> = {
  STRUCTURAL_FIRE: '🏠🔥', VEHICLE_FIRE: '🚗🔥', WILDFIRE: '🌿🔥',
  GAS_LEAK: '💨⚠️', CHEMICAL_SPILL: '☣️', EXPLOSION: '💥',
  RESCUE_TRAPPED: '🆘', ELECTRICAL_FIRE: '⚡🔥', OTHER: '🔥',
};

export const HAZMAT_COLORS: Record<string, string> = {
  LEVEL_1: '#34A853', LEVEL_2: '#F9AB00', LEVEL_3: '#d93025', LEVEL_4: '#9334E6',
};

export const EVIDENCE_TYPE_ICONS: Record<string, string> = {
  PHOTO: '📷', VIDEO: '🎥', DOCUMENT: '📄', AUDIO: '🎵',
  PHYSICAL_DESCRIPTION: '🔍', WITNESS_STATEMENT: '🗣️', OTHER: '📦',
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

export const RWANDA_DISTRICTS = [
  'Nyarugenge','Gasabo','Kicukiro','Nyanza','Gisagara','Nyaruguru','Huye','Nyamagabe',
  'Ruhango','Muhanga','Kamonyi','Karongi','Rutsiro','Rubavu','Nyabihu','Ngororero',
  'Rusizi','Nyamasheke','Rulindo','Gakenke','Musanze','Burera','Gicumbi','Rwamagana',
  'Nyagatare','Gatsibo','Kayonza','Kirehe','Ngoma','Bugesera',
];

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  RECEIVED: ['UNDER_REVIEW', 'CANCELLED'], UNDER_REVIEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['DISPATCHED', 'CANCELLED'], DISPATCHED: ['ON_SCENE'],
  ON_SCENE: ['RESOLVED'], RESOLVED: ['CLOSED'], CLOSED: [], CANCELLED: [],
};

export const AMBULANCE_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE: ['DISPATCHED'], DISPATCHED: ['ON_SCENE', 'AVAILABLE'],
  ON_SCENE: ['TRANSPORTING', 'AVAILABLE'], TRANSPORTING: ['AT_HOSPITAL'],
  AT_HOSPITAL: ['AVAILABLE'], OFF_DUTY: ['AVAILABLE'], MAINTENANCE: ['AVAILABLE'],
};

export const UNIT_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE: ['RESPONDING'], RESPONDING: ['ON_SCENE', 'AVAILABLE'],
  ON_SCENE: ['RETURNING', 'AVAILABLE'], RETURNING: ['AVAILABLE'],
  OFF_DUTY: ['AVAILABLE'], MAINTENANCE: ['AVAILABLE'],
};

// Compatibility aliases
export const PoliceTheme = Theme;
export const HospitalTheme = Theme;
export const FireTheme = Theme;
export const RIBTheme = Theme;
