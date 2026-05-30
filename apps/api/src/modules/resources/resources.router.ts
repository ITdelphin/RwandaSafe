import { Router } from 'express';
import { resourcesController } from './resources.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const resourcesRouter = Router();

resourcesRouter.get('/', requireAuth, agencyGuard, resourcesController.list);
resourcesRouter.patch('/:id/status', requireAuth, agencyGuard, resourcesController.updateStatus);
resourcesRouter.patch('/:id/location', requireAuth, agencyGuard, resourcesController.updateLocation);
