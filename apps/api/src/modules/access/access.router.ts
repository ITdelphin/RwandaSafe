import { Router } from 'express';
import { accessController } from './access.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

export const accessRouter = Router();

accessRouter.use(requireAuth);

// Anyone can view their own access
accessRouter.get('/me', accessController.getMyAccess);

// Only Super Admin can view all and modify access
accessRouter.use(requireRole(Role.SUPER_ADMIN));

accessRouter.get('/', accessController.listAllAccess);
accessRouter.get('/users', accessController.listAllUsers);
accessRouter.post('/grant', accessController.grantAccess);
accessRouter.post('/grant-multiple', accessController.grantMultipleAccess);
accessRouter.post('/promote-and-grant', accessController.promoteAndGrant);
accessRouter.delete('/revoke', accessController.revokeAccess);
