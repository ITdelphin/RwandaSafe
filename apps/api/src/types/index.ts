import { Role, IncidentType, IncidentSeverity, IncidentStatus, AgencyType } from '@prisma/client';

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

export interface JwtPayload {
  id: string;
  phone: string;
  role: Role;
  isAnonymous: boolean;
  iat?: number;
  exp?: number;
}

export { Role, IncidentType, IncidentSeverity, IncidentStatus, AgencyType };
