import { Router } from 'express';
import { investigationController } from './investigation.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const investigationRouter = Router();

// All investigation routes require auth and agency guard (RIB role enforced at controller/service level)
investigationRouter.use(requireAuth);
investigationRouter.use(agencyGuard);

// Create a new investigation
investigationRouter.post('/', investigationController.createInvestigation);

// List all investigations for the agency
investigationRouter.get('/', investigationController.getInvestigations);

// Evidence URL lookup (must be before /:id to avoid route conflict)
investigationRouter.get('/evidence/:id/url', investigationController.getEvidenceUrl);

// Suspect status update (must be before /:id to avoid conflict)
investigationRouter.patch('/suspects/:id/status', investigationController.updateSuspectStatus);

// Get a single investigation
investigationRouter.get('/:id', investigationController.getInvestigation);

// Update investigation status
investigationRouter.patch('/:id/status', investigationController.updateStatus);

// Link incidents to investigation
investigationRouter.post('/:id/link-incidents', investigationController.linkIncidents);

// Add suspect
investigationRouter.post('/:id/suspects', investigationController.addSuspect);

// Upload evidence
investigationRouter.post('/:id/evidence', investigationController.uploadEvidence);

// Get evidence list
investigationRouter.get('/:id/evidence', investigationController.getEvidence);

// Close investigation
investigationRouter.post('/:id/close', investigationController.closeInvestigation);

// Export PDF
investigationRouter.get('/:id/export-pdf', investigationController.exportPdf);
