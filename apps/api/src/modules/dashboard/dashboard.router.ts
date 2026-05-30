import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.use(agencyGuard);

dashboardRouter.get('/incidents', dashboardController.getIncidents);
dashboardRouter.get('/map', dashboardController.getMapData);
dashboardRouter.get('/stats', dashboardController.getStats);
dashboardRouter.get('/officers', dashboardController.getOfficers);
dashboardRouter.post('/forward', dashboardController.forwardIncident);
dashboardRouter.post('/handover', dashboardController.createHandover);
dashboardRouter.get('/handover/latest', dashboardController.getLatestHandover);
