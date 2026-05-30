import { Router } from 'express';
import { capacityController } from './capacity.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const capacityRouter = Router();

capacityRouter.use(requireAuth);
capacityRouter.use(agencyGuard);

// GET /v1/capacity
capacityRouter.get('/', capacityController.getAllCapacity);

// GET /v1/capacity/:agencyId
capacityRouter.get('/:agencyId', capacityController.getCapacity);

// PATCH /v1/capacity/:agencyId
capacityRouter.patch('/:agencyId', capacityController.updateCapacity);

// POST /v1/capacity/:agencyId/release-bed
capacityRouter.post('/:agencyId/release-bed', capacityController.releaseBed);
