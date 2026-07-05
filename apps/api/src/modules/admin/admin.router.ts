import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { adminController } from './admin.controller';
import { Role } from '@prisma/client';

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole(Role.SUPER_ADMIN));

adminRouter.get('/stats', adminController.getStats);
adminRouter.get('/users', adminController.getUsers);
adminRouter.get('/users/:id', adminController.getUser);
adminRouter.patch('/users/:id', adminController.updateUser);
adminRouter.post('/users/:id/suspend', adminController.suspendUser);
adminRouter.post('/users/:id/activate', adminController.activateUser);
adminRouter.get('/approvals/pending', adminController.getPendingApprovals);
adminRouter.post('/approvals/:id/approve', adminController.approveUser);
adminRouter.post('/approvals/:id/reject', adminController.rejectUser);
adminRouter.get('/agencies', adminController.getAgencies);
adminRouter.post('/agencies', adminController.createAgency);
adminRouter.patch('/agencies/:id', adminController.updateAgency);
adminRouter.get('/audit-logs', adminController.getAuditLogs);
adminRouter.get('/system-health', adminController.getSystemHealth);
adminRouter.get('/broadcasts', adminController.getBroadcasts);
adminRouter.post('/broadcasts', adminController.createBroadcast);
adminRouter.delete('/broadcasts/:id', adminController.deleteBroadcast);
