import { Role } from '@prisma/client';
import { requireRole } from './auth';

export const requireCitizen = requireRole(Role.CITIZEN);
export const requirePolice = requireRole(Role.POLICE_OFFICER);
export const requireMedical = requireRole(Role.MEDICAL_RESPONDER);
export const requireFire = requireRole(Role.FIRE_OFFICER);
export const requireRib = requireRole(Role.RIB_INVESTIGATOR);
export const requireAdmin = requireRole(Role.SUPER_ADMIN);

export const requireAnyOfficer = requireRole(
  Role.POLICE_OFFICER,
  Role.MEDICAL_RESPONDER,
  Role.FIRE_OFFICER,
  Role.RIB_INVESTIGATOR,
  Role.SUPER_ADMIN
);
