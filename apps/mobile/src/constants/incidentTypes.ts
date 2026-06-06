import { Colors } from './colors';

export const INCIDENT_TYPES = [
  { key: 'ACCIDENT',         label: 'Accident',         icon: 'car-outline',           color: Colors.accident },
  { key: 'MEDICAL_EMERGENCY',label: 'Medical',          icon: 'medkit',                color: Colors.medical },
  { key: 'CRIME',            label: 'Crime',            icon: 'alert-circle',          color: Colors.crime },
  { key: 'FIRE',             label: 'Fire',             icon: 'flame',                 color: Colors.fire },
  { key: 'GBV',              label: 'GBV',              icon: 'warning-outline',       color: Colors.gbv },
  { key: 'CORRUPTION',       label: 'Corruption',       icon: 'briefcase-outline',     color: Colors.corruption },
  { key: 'MISSING_PERSON',   label: 'Missing Person',   icon: 'person-outline',        color: Colors.missing },
  { key: 'NATURAL_DISASTER', label: 'Natural Disaster', icon: 'thunderstorm-outline',  color: Colors.disaster },
  { key: 'OTHER',            label: 'Other',            icon: 'help-circle-outline',   color: Colors.textSecondary },
] as const;

export const RWANDA_DISTRICTS = [
  'Bugesera','Burera','Gakenke','Gasabo','Gatsibo','Gicumbi','Gisagara',
  'Huye','Kamonyi','Karongi','Kayonza','Kicukiro','Kirehe','Muhanga',
  'Musanze','Ngabo','Ngoma','Ngororero','Nyabihu','Nyagatare','Nyamagabe',
  'Nyamasheke','Nyanza','Nyarugenge','Nyaruguru','Rubavu','Ruhango',
  'Rulindo','Rusizi','Rutsiro','Rwamagana',
];
