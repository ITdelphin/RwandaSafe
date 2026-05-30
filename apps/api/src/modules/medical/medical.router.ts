import { Router } from 'express';
import { medicalController } from './medical.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const medicalRouter = Router();

medicalRouter.use(requireAuth);
medicalRouter.use(agencyGuard);

// Triage & patient data
medicalRouter.post('/:incidentId/triage', medicalController.setTriage);

// Dispatch ambulance to incident
medicalRouter.post('/:incidentId/dispatch', medicalController.dispatchAmbulance);

// Update ambulance status
medicalRouter.patch('/ambulances/:id/status', medicalController.updateAmbulanceStatus);

// Recommend nearest hospitals
medicalRouter.get('/:incidentId/recommend', medicalController.recommendHospital);

// Assign receiving hospital
medicalRouter.post('/:incidentId/hospital', medicalController.assignHospital);

// Mass casualty event activation
medicalRouter.post('/mass-casualty', medicalController.activateMassCasualty);

// Telemedicine session
medicalRouter.post('/:incidentId/telemedicine', medicalController.createTelemedicine);

// Blood bank overview
medicalRouter.get('/blood-bank', medicalController.getBloodBank);
