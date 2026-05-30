import { Router } from 'express';
import { officersController } from './officers.controller';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';

export const officersRouter = Router();

// List and get one require agencyGuard
officersRouter.get('/', requireAuth, agencyGuard, officersController.list);
officersRouter.get('/:id', requireAuth, agencyGuard, officersController.getById);
officersRouter.patch('/:id/duty', requireAuth, agencyGuard, officersController.toggleDuty);

// Location update only requires auth (officer updates own location)
officersRouter.patch('/:id/location', requireAuth, officersController.updateLocation);
