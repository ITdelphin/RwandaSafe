import { Router } from 'express';
import { medicalController } from './medical.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const ambulanceRouter = Router();

ambulanceRouter.use(requireAuth);
ambulanceRouter.use(agencyGuard);

// GET /v1/ambulances/available  — must be before /:id routes
ambulanceRouter.get('/available', medicalController.getAvailableAmbulances);

// GET /v1/ambulances
ambulanceRouter.get('/', medicalController.getAmbulances);

// PATCH /v1/ambulances/:id/location
ambulanceRouter.patch('/:id/location', medicalController.updateAmbulanceLocation);
