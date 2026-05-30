import { Colors } from './colors';

export const INCIDENT_TYPES = [
  { key: 'ACCIDENT',         label: 'Accident',         icon: '🚗', color: Colors.accident },
  { key: 'MEDICAL_EMERGENCY',label: 'Medical',          icon: '🏥', color: Colors.medical },
  { key: 'CRIME',            label: 'Crime',            icon: '🚨', color: Colors.crime },
  { key: 'FIRE',             label: 'Fire',             icon: '🔥', color: Colors.fire },
  { key: 'GBV',              label: 'GBV',              icon: '⚠️', color: Colors.gbv },
  { key: 'CORRUPTION',       label: 'Corruption',       icon: '📋', color: Colors.corruption },
  { key: 'MISSING_PERSON',   label: 'Missing Person',   icon: '🔍', color: Colors.missing },
  { key: 'NATURAL_DISASTER', label: 'Natural Disaster', icon: '🌪️', color: Colors.disaster },
  { key: 'OTHER',            label: 'Other',            icon: '❗', color: Colors.textSecondary },
] as const;

export const RWANDA_DISTRICTS = [
  'Bugesera','Burera','Gakenke','Gasabo','Gatsibo','Gicumbi','Gisagara',
  'Huye','Kamonyi','Karongi','Kayonza','Kicukiro','Kirehe','Muhanga',
  'Musanze','Ngabo','Ngoma','Ngororero','Nyabihu','Nyagatare','Nyamagabe',
  'Nyamasheke','Nyanza','Nyarugenge','Nyaruguru','Rubavu','Ruhango',
  'Rulindo','Rusizi','Rutsiro','Rwamagana',
];
