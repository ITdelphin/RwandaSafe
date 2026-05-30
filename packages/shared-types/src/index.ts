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
