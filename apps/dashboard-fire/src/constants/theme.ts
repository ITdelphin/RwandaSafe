export const FireTheme = {
  sidebar:        '#1A0800',
  sidebarActive:  '#7C2D12',
  topbar:         '#FFFFFF',
  background:     '#FFF7ED',
  surface:        '#FFFFFF',
  border:         '#FED7AA',
  primary:        '#EA580C',
  primaryHover:   '#C2410C',
  unitAvailable:  '#22C55E',
  unitResponding: '#F59E0B',
  unitOnScene:    '#EF4444',
  unitReturning:  '#8B5CF6',
  hazmatLevel1:   '#22C55E',
  hazmatLevel2:   '#F59E0B',
  hazmatLevel3:   '#EF4444',
  hazmatLevel4:   '#7C3AED',
};

export const UNIT_COLORS: Record<string, string> = {
  AVAILABLE: '#22C55E', RESPONDING: '#F59E0B', ON_SCENE: '#EF4444',
  RETURNING: '#8B5CF6', MAINTENANCE: '#64748B', OFF_DUTY: '#94A3B8',
};

export const HAZMAT_COLORS: Record<string, string> = {
  LEVEL_1: '#22C55E', LEVEL_2: '#F59E0B', LEVEL_3: '#EF4444', LEVEL_4: '#7C3AED',
};

export const FIRE_TYPE_ICONS: Record<string, string> = {
  STRUCTURAL_FIRE: '🏠🔥', VEHICLE_FIRE: '🚗🔥', WILDFIRE: '🌿🔥',
  GAS_LEAK: '💨⚠️', CHEMICAL_SPILL: '☣️', EXPLOSION: '💥',
  RESCUE_TRAPPED: '🆘', ELECTRICAL_FIRE: '⚡🔥', OTHER: '🔥',
};

export const UNIT_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE: ['RESPONDING'], RESPONDING: ['ON_SCENE', 'AVAILABLE'],
  ON_SCENE: ['RETURNING', 'AVAILABLE'], RETURNING: ['AVAILABLE'],
  OFF_DUTY: ['AVAILABLE'], MAINTENANCE: ['AVAILABLE'],
};

// Compatibility exports
export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#D32F2F', HIGH: '#F57C00', MEDIUM: '#1976D2', LOW: '#757575',
};
export const STATUS_COLORS: Record<string, string> = {
  RECEIVED: '#64748B', UNDER_REVIEW: '#3B82F6', ASSIGNED: '#8B5CF6',
  DISPATCHED: '#F59E0B', ON_SCENE: '#EF4444', RESOLVED: '#22C55E',
  CLOSED: '#94A3B8', CANCELLED: '#F43F5E',
};
export const RWANDA_DISTRICTS = [
  'Nyarugenge','Gasabo','Kicukiro','Nyanza','Gisagara','Nyaruguru','Huye','Nyamagabe',
  'Ruhango','Muhanga','Kamonyi','Karongi','Rutsiro','Rubavu','Nyabihu','Ngororero',
  'Rusizi','Nyamasheke','Rulindo','Gakenke','Musanze','Burera','Gicumbi','Rwamagana',
  'Nyagatare','Gatsibo','Kayonza','Kirehe','Ngoma','Bugesera',
];
export const INCIDENT_TYPES = [
  { key: 'ACCIDENT', label: 'Accident', icon: '🚗' },
  { key: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: '🏥' },
  { key: 'CRIME', label: 'Crime', icon: '🚨' },
  { key: 'FIRE', label: 'Fire', icon: '🔥' },
  { key: 'GBV', label: 'GBV', icon: '⚠️' },
  { key: 'CORRUPTION', label: 'Corruption', icon: '📋' },
  { key: 'MISSING_PERSON', label: 'Missing Person', icon: '🔍' },
  { key: 'NATURAL_DISASTER', label: 'Natural Disaster', icon: '🌪️' },
  { key: 'OTHER', label: 'Other', icon: '❗' },
];
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  RECEIVED: ['UNDER_REVIEW', 'CANCELLED'], UNDER_REVIEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['DISPATCHED', 'CANCELLED'], DISPATCHED: ['ON_SCENE'],
  ON_SCENE: ['RESOLVED'], RESOLVED: ['CLOSED'], CLOSED: [], CANCELLED: [],
};
export const PoliceTheme = FireTheme;
