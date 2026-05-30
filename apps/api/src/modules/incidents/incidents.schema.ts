import { z } from 'zod';
import { IncidentType, IncidentSeverity } from '@prisma/client';

export const createIncidentSchema = z.object({
  body: z.object({
    type: z.nativeEnum(IncidentType),
    severity: z.nativeEnum(IncidentSeverity).default('MEDIUM'),
    title: z.string().max(200).optional(),
    description: z.string().min(10, 'Please describe the incident in at least 10 characters').max(2000),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().max(500).optional(),
    district: z.string().max(100).optional(),
    isAnonymous: z.boolean().default(false),
    witnessName: z.string().max(100).optional(),
    witnessPhone: z.string().optional(),
  }),
});

export const updateIncidentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['UNDER_REVIEW', 'ASSIGNED', 'DISPATCHED', 'ON_SCENE', 'RESOLVED', 'CLOSED', 'CANCELLED']),
    note: z.string().max(500).optional(),
  }),
});

export const addNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    note: z.string().min(1).max(2000),
    isInternal: z.boolean().default(false),
  }),
});

export const listIncidentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().max(100).default(20),
    status: z.string().optional(),
    type: z.string().optional(),
    severity: z.string().optional(),
    district: z.string().optional(),
    agencyType: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const assignIncidentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    officerId: z.string().uuid().optional(),
    agencyId: z.string().uuid(),
    notes: z.string().optional(),
  }),
});

export const feedbackSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  }),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>['body'];
export type UpdateStatusInput = z.infer<typeof updateIncidentStatusSchema>['body'];
export type AssignIncidentInput = z.infer<typeof assignIncidentSchema>['body'];
