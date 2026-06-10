// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Role {
  CITIZEN = 'CITIZEN',
  POLICE_OFFICER = 'POLICE_OFFICER',
  MEDICAL_RESPONDER = 'MEDICAL_RESPONDER',
  FIRE_OFFICER = 'FIRE_OFFICER',
  RIB_INVESTIGATOR = 'RIB_INVESTIGATOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum IncidentType {
  ACCIDENT = 'ACCIDENT',
  MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
  CRIME = 'CRIME',
  FIRE = 'FIRE',
  GBV = 'GBV',
  CORRUPTION = 'CORRUPTION',
  MISSING_PERSON = 'MISSING_PERSON',
  NATURAL_DISASTER = 'NATURAL_DISASTER',
  OTHER = 'OTHER',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  RECEIVED = 'RECEIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  DISPATCHED = 'DISPATCHED',
  ON_SCENE = 'ON_SCENE',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum AgencyType {
  POLICE = 'POLICE',
  HOSPITAL = 'HOSPITAL',
  FIRE = 'FIRE',
  RIB = 'RIB',
  GOVERNMENT = 'GOVERNMENT',
}

export enum ResourceType {
  POLICE_VEHICLE = 'POLICE_VEHICLE',
  AMBULANCE = 'AMBULANCE',
  FIRE_TRUCK = 'FIRE_TRUCK',
  RESCUE_UNIT = 'RESCUE_UNIT',
  INVESTIGATION_VEHICLE = 'INVESTIGATION_VEHICLE',
}

export enum ResourceStatus {
  AVAILABLE = 'AVAILABLE',
  DISPATCHED = 'DISPATCHED',
  ON_SCENE = 'ON_SCENE',
  TRANSPORTING = 'TRANSPORTING',
  AT_HOSPITAL = 'AT_HOSPITAL',
  MAINTENANCE = 'MAINTENANCE',
  OFF_DUTY = 'OFF_DUTY',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  DANGER = 'DANGER',
  CRITICAL = 'CRITICAL',
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// ─── Entity Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  name?: string | null;
  nidaId?: string | null;
  role: Role;
  isVerified: boolean;
  isAnonymous: boolean;
  isActive: boolean;
  fcmToken?: string | null;
  preferredLang: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface Agency {
  id: string;
  name: string;
  type: AgencyType;
  region?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Officer {
  id: string;
  userId: string;
  agencyId: string;
  badgeNumber?: string | null;
  rank?: string | null;
  isOnDuty: boolean;
  currentLat?: number | null;
  currentLng?: number | null;
  user?: User;
  agency?: Agency;
}

export interface Incident {
  id: string;
  trackingCode: string;
  type: IncidentType;
  category?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title?: string | null;
  description: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  district?: string | null;
  isAnonymous: boolean;
  reporterId?: string | null;
  targetAgency?: AgencyType | null;
  isClosed: boolean;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: User | null;
  media?: IncidentMedia[];
  assignments?: Assignment[];
}

export interface IncidentMedia {
  id: string;
  incidentId: string;
  url: string;
  publicId?: string | null;
  type: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  filename?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
}

export interface Assignment {
  id: string;
  incidentId: string;
  officerId?: string | null;
  agencyId: string;
  assignedAt: string;
  status: string;
  respondedAt?: string | null;
  closedAt?: string | null;
  officer?: Officer | null;
  agency?: Agency;
}

export interface Resource {
  id: string;
  agencyId: string;
  type: ResourceType;
  name: string;
  plateNumber?: string | null;
  status: ResourceStatus;
  currentLat?: number | null;
  currentLng?: number | null;
  isActive: boolean;
  agency?: Agency;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  district?: string | null;
  severity: AlertSeverity;
  issuedById: string;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface Feedback {
  id: string;
  incidentId: string;
  submittedById: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

// ─── Medical Types ────────────────────────────────────────────────────────────

export enum TriageLevel {
  IMMEDIATE = 'IMMEDIATE',
  URGENT = 'URGENT',
  DELAYED = 'DELAYED',
  EXPECTANT = 'EXPECTANT',
}

export enum AmbulanceStatus {
  AVAILABLE = 'AVAILABLE',
  DISPATCHED = 'DISPATCHED',
  ON_SCENE = 'ON_SCENE',
  TRANSPORTING = 'TRANSPORTING',
  AT_HOSPITAL = 'AT_HOSPITAL',
  OFF_DUTY = 'OFF_DUTY',
  MAINTENANCE = 'MAINTENANCE',
}

export enum BloodType {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE',
  UNKNOWN = 'UNKNOWN',
}

export interface MedicalCase {
  id: string;
  incidentId: string;
  triageLevel: TriageLevel;
  reportedSymptoms: string[];
  patientAge?: number | null;
  patientGender?: string | null;
  patientBloodType: BloodType;
  isConscious?: boolean | null;
  isBreathing?: boolean | null;
  vitalSigns?: Record<string, any> | null;
  medicalNotes?: string | null;
  receivingHospitalId?: string | null;
  ambulanceId?: string | null;
  dispatchedAt?: string | null;
  arrivedSceneAt?: string | null;
  arrivedHospitalAt?: string | null;
  isMassCasualty: boolean;
  massCasualtyId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ambulance {
  id: string;
  agencyId: string;
  callSign: string;
  plateNumber?: string | null;
  status: AmbulanceStatus;
  currentLat?: number | null;
  currentLng?: number | null;
  crewCount: number;
  hasDefibrillator: boolean;
  hasOxygen: boolean;
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
}

export interface HospitalCapacity {
  id: string;
  agencyId: string;
  emergencyBedsTotal: number;
  emergencyBedsAvail: number;
  icuBedsTotal: number;
  icuBedsAvail: number;
  bloodBankAPos: number;
  bloodBankANeg: number;
  bloodBankBPos: number;
  bloodBankBNeg: number;
  bloodBankOPos: number;
  bloodBankONeg: number;
  bloodBankABPos: number;
  bloodBankABNeg: number;
  surgeonOnCall: boolean;
  neurologistOnCall: boolean;
  cardiologistOnCall: boolean;
  pediatricianOnCall: boolean;
  isAcceptingPatients: boolean;
  statusMessage?: string | null;
  updatedAt: string;
}

// ─── Fire Types ───────────────────────────────────────────────────────────────

export enum FireIncidentType {
  STRUCTURAL_FIRE = 'STRUCTURAL_FIRE',
  VEHICLE_FIRE = 'VEHICLE_FIRE',
  WILDFIRE = 'WILDFIRE',
  GAS_LEAK = 'GAS_LEAK',
  CHEMICAL_SPILL = 'CHEMICAL_SPILL',
  EXPLOSION = 'EXPLOSION',
  RESCUE_TRAPPED = 'RESCUE_TRAPPED',
  ELECTRICAL_FIRE = 'ELECTRICAL_FIRE',
  OTHER = 'OTHER',
}

export enum FireUnitStatus {
  AVAILABLE = 'AVAILABLE',
  RESPONDING = 'RESPONDING',
  ON_SCENE = 'ON_SCENE',
  RETURNING = 'RETURNING',
  MAINTENANCE = 'MAINTENANCE',
  OFF_DUTY = 'OFF_DUTY',
}

export enum HazmatLevel {
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEVEL_4 = 'LEVEL_4',
}

export interface FireUnit {
  id: string;
  agencyId: string;
  callSign: string;
  plateNumber?: string | null;
  unitType: string;
  status: FireUnitStatus;
  crewCount: number;
  currentLat?: number | null;
  currentLng?: number | null;
  waterCapacityL?: number | null;
  hasHazmatKit: boolean;
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
}

export interface FireReport {
  id: string;
  incidentId: string;
  fireType: FireIncidentType;
  hazmatLevel?: HazmatLevel | null;
  chemicalInvolved?: string | null;
  buildingType?: string | null;
  buildingFloors?: number | null;
  estimatedOccupancy?: number | null;
  fireUnitId?: string | null;
  additionalUnitsIds: string[];
  dispatchedAt?: string | null;
  arrivedAt?: string | null;
  containedAt?: string | null;
  resolvedAt?: string | null;
  windSpeed?: number | null;
  windDirection?: string | null;
  weatherCondition?: string | null;
  casualties: number;
  postIncidentReport?: string | null;
  reportSubmittedAt?: string | null;
  reportSubmittedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Investigation Types ──────────────────────────────────────────────────────

export enum InvestigationStatus {
  OPEN = 'OPEN',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED_SOLVED = 'CLOSED_SOLVED',
  CLOSED_UNSOLVED = 'CLOSED_UNSOLVED',
  REFERRED = 'REFERRED',
}

export enum EvidenceType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  PHYSICAL_DESCRIPTION = 'PHYSICAL_DESCRIPTION',
  WITNESS_STATEMENT = 'WITNESS_STATEMENT',
  OTHER = 'OTHER',
}

export enum SuspectStatus {
  PERSON_OF_INTEREST = 'PERSON_OF_INTEREST',
  SUSPECT = 'SUSPECT',
  CHARGED = 'CHARGED',
  ACQUITTED = 'ACQUITTED',
  CONVICTED = 'CONVICTED',
}

export interface Investigation {
  id: string;
  caseNumber: string;
  incidentId?: string | null;
  title: string;
  description: string;
  status: InvestigationStatus;
  leadInvestigatorId?: string | null;
  agencyId: string;
  classificationLevel: string;
  isSensitive: boolean;
  openedAt: string;
  closedAt?: string | null;
  closureNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Suspect {
  id: string;
  investigationId: string;
  alias?: string | null;
  description?: string | null;
  age?: number | null;
  gender?: string | null;
  nationality?: string | null;
  knownAddresses: string[];
  status: SuspectStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvestigationEvidence {
  id: string;
  investigationId: string;
  suspectId?: string | null;
  type: EvidenceType;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  filePublicId?: string | null;
  collectedAt?: string | null;
  collectedById?: string | null;
  chainOfCustody?: Record<string, any> | null;
  isAdmissible: boolean;
  createdAt: string;
}

export interface Tip {
  id: string;
  investigationId?: string | null;
  content: string;
  submitterPhone?: string | null;
  isAnonymous: boolean;
  isReviewed: boolean;
  isCredible?: boolean | null;
  reviewedById?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
}

// ─── SLA / Config / Audit / Broadcast Types ───────────────────────────────────

export interface SlaConfig {
  id: string;
  agencyType: string;
  severity: string;
  targetMinutes: number;
  warningMinutes: number;
  updatedById: string;
  updatedAt: string;
  createdAt: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  label: string;
  category: string;
  updatedById: string;
  updatedAt: string;
}

export interface BroadcastAlert {
  id: string;
  title: string;
  message: string;
  district?: string | null;
  severity: string;
  issuedById: string;
  targetCount: number;
  deliveredCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface SystemHealth {
  statuses: Record<string, string>;
  lastActivity: string | null;
  lastIncidentTrackingCode: string | null;
  timestamp: string;
}

export interface OpenDataSummary {
  month: string;
  totalIncidents: number;
  mostCommonType: string | null;
  mostCommonTypePercentage: number;
  mostAffectedDistrict: string | null;
  mostAffectedDistrictPercentage: number;
  resolutionRate: number;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface AgencyScorecard {
  agency: string;
  totalCases: number;
  resolvedCases: number;
  resolutionRate: number;
  avgResponseTimeMinutes: number;
  slaBreachCount: number;
  slaCompliance: number;
  openCases: number;
  criticalOpen: number;
  officerCount: number;
  onDutyCount: number;
  performanceScore: number;
}

export interface NationalStats {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  closedIncidents: number;
  activeOfficers: number;
  byAgency: { agency: string; total: number; open: number; resolved: number }[];
  byType: { type: string; _count: number }[];
  byDistrict: { district: string; _count: number }[];
  bySeverity: { severity: string; _count: number }[];
  dailyTrend: { date: string; count: number }[];
}
