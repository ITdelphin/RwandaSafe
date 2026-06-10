import { z } from 'zod';

export const createOfficerSchema = z.object({
  phone: z.string().regex(/^\+250\d{9}$/, 'Invalid Rwandan phone number'),
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  role: z.enum(['POLICE_OFFICER', 'MEDICAL_RESPONDER', 'FIRE_OFFICER', 'RIB_INVESTIGATOR']),
  agencyId: z.string().uuid(),
  badgeNumber: z.string().optional(),
  rank: z.string().optional(),
  sendSms: z.boolean().optional(),
});

export const broadcastAlertSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  severity: z.enum(['INFO', 'WARNING', 'DANGER', 'CRITICAL']),
  district: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const suspendUserSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const updateSystemConfigSchema = z.object({
  value: z.string().min(1),
});
