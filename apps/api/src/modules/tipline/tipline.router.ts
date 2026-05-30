import { Router } from 'express';
import { tiplineController } from './tipline.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const tiplineRouter = Router();

// POST /v1/tips — NO auth required; anyone can submit a tip
tiplineRouter.post('/', tiplineController.submitTip);

// GET /v1/tips — requires auth (RIB officers only)
tiplineRouter.get('/', requireAuth, agencyGuard, tiplineController.getTips);

// PATCH /v1/tips/:id/review — requires auth (RIB officers only)
tiplineRouter.patch('/:id/review', requireAuth, agencyGuard, tiplineController.reviewTip);
