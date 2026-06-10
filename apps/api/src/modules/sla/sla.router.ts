import { Router } from 'express';
import { slaController } from './sla.controller';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/rbac';

export const slaRouter = Router();

slaRouter.use(requireAuth, requireAdmin);

slaRouter.get('/', slaController.getSlaConfigs);
slaRouter.patch('/:id', slaController.updateSlaConfig);
slaRouter.get('/breaches', slaController.getSlaBreachReport);
