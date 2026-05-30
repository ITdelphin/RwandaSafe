import { Router } from 'express';
import { incidentsController } from './incidents.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createIncidentSchema,
  updateIncidentStatusSchema,
  addNoteSchema,
  listIncidentsSchema,
  assignIncidentSchema,
  feedbackSchema,
} from './incidents.schema';
import { Role } from '@prisma/client';

export const incidentsRouter = Router();

const officerRoles = [Role.POLICE_OFFICER, Role.MEDICAL_RESPONDER, Role.FIRE_OFFICER, Role.RIB_INVESTIGATOR, Role.SUPER_ADMIN];

// Public tracking — no auth
incidentsRouter.get('/track/:trackingCode', incidentsController.track);

// Create incident — allow anonymous (no auth required)
incidentsRouter.post(
  '/',
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) return requireAuth(req, res, next);
    next();
  },
  validate(createIncidentSchema),
  incidentsController.create
);

// All routes below require auth
incidentsRouter.use(requireAuth);

incidentsRouter.get('/', validate(listIncidentsSchema), incidentsController.list);
incidentsRouter.get('/:id', incidentsController.getById);
incidentsRouter.get('/:id/history', incidentsController.getHistory);
incidentsRouter.get('/:id/notes', incidentsController.getNotes);

incidentsRouter.post('/:id/notes', validate(addNoteSchema), incidentsController.addNote);
incidentsRouter.post('/:id/cancel', incidentsController.cancel);
incidentsRouter.post('/:id/feedback', validate(feedbackSchema), incidentsController.feedback);

// Officer-only routes
incidentsRouter.patch(
  '/:id/status',
  requireRole(...officerRoles),
  validate(updateIncidentStatusSchema),
  incidentsController.updateStatus
);

incidentsRouter.post(
  '/:id/assign',
  requireRole(...officerRoles),
  validate(assignIncidentSchema),
  incidentsController.assign
);
