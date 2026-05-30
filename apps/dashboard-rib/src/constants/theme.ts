export const RIBTheme = {
  sidebar:        '#0A0A1A',
  sidebarActive:  '#1E1B4B',
  topbar:         '#FFFFFF',
  background:     '#F5F3FF',
  surface:        '#FFFFFF',
  border:         '#DDD6FE',
  primary:        '#4C1D95',
  primaryHover:   '#3B0764',
  statusOpen:         '#3B82F6',
  statusActive:       '#8B5CF6',
  statusSuspended:    '#6B7280',
  statusClosedSolved: '#22C55E',
  statusClosedUnsolved:'#EF4444',
  statusReferred:     '#F59E0B',
  suspectPOI:       '#F59E0B',
  suspectSuspect:   '#EF4444',
  suspectCharged:   '#8B5CF6',
  suspectAcquitted: '#6B7280',
  suspectConvicted: '#DC2626',
  evidencePhoto:    '#3B82F6',
  evidenceVideo:    '#8B5CF6',
  evidenceDocument: '#10B981',
  evidenceAudio:    '#F59E0B',
};

export const INVESTIGATION_STATUS_COLORS: Record<string, string> = {
  OPEN: '#3B82F6', ACTIVE: '#8B5CF6', SUSPENDED: '#6B7280',
  CLOSED_SOLVED: '#22C55E', CLOSED_UNSOLVED: '#EF4444', REFERRED: '#F59E0B',
};

export const SUSPECT_STATUS_COLORS: Record<string, string> = {
  PERSON_OF_INTEREST: '#F59E0B', SUSPECT: '#EF4444', CHARGED: '#8B5CF6',
  ACQUITTED: '#6B7280', CONVICTED: '#DC2626',
};

export const EVIDENCE_TYPE_ICONS: Record<string, string> = {
  PHOTO: '📷', VIDEO: '🎥', DOCUMENT: '📄', AUDIO: '🎵',
  PHYSICAL_DESCRIPTION: '🔍', WITNESS_STATEMENT: '🗣️', OTHER: '📦',
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
export const PoliceTheme = RIBTheme;
