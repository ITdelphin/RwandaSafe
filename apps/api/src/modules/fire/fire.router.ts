import { Router } from 'express';
import { fireController } from './fire.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const fireRouter = Router();

// All fire routes require authentication and agency guard
fireRouter.use(requireAuth);
fireRouter.use(agencyGuard);

// Fire report — create / upsert
fireRouter.post('/report', fireController.createFireReport);

// Dispatch units to an incident
fireRouter.post('/:incidentId/dispatch', fireController.dispatchUnits);

// Update fire unit status
fireRouter.patch('/units/:id/status', fireController.updateUnitStatus);

// Get nearest hydrants (public-ish but guarded)
fireRouter.get('/:incidentId/hydrants', fireController.getNearestHydrants);

// Get weather data for incident location
fireRouter.get('/:incidentId/weather', fireController.getWeatherData);

// Hazmat chemical lookup
fireRouter.get('/chemicals', fireController.lookupChemical);

// Submit post-incident report
fireRouter.post('/:incidentId/post-report', fireController.submitPostIncidentReport);

// Get all fire units for the agency
fireRouter.get('/units', fireController.getFireUnits);

// Get only available fire units
fireRouter.get('/units/available', fireController.getAvailableUnits);

// Get fire reports
fireRouter.get('/reports', fireController.getFireReports);
