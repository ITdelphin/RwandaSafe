import { Router } from 'express';
import { adminController } from './admin.controller';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/rbac';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', adminController.getNationalStats);
adminRouter.get('/scorecard', adminController.getAgencyScorecard);
adminRouter.get('/map', adminController.getNationalMapData);
adminRouter.get('/heatmap', adminController.getHeatMapData);
adminRouter.get('/heatmap/animated', adminController.getAnimatedHeatMapData);

adminRouter.get('/users', adminController.listUsers);
adminRouter.post('/users/officer', adminController.createOfficerAccount);
adminRouter.get('/users/:id', adminController.getUserDetail);
adminRouter.patch('/users/:id/suspend', adminController.suspendUser);
adminRouter.patch('/users/:id/reactivate', adminController.reactivateUser);
adminRouter.post('/users/:id/promote', adminController.promoteToOfficer);
adminRouter.delete('/users/:id', adminController.deleteUser);

adminRouter.post('/broadcast', adminController.sendBroadcastAlert);
adminRouter.get('/broadcasts', adminController.getBroadcastAlerts);
adminRouter.delete('/broadcasts/:id', adminController.deactivateBroadcastAlert);

adminRouter.get('/audit', adminController.getAuditLog);

adminRouter.get('/health', adminController.getSystemHealth);

adminRouter.get('/config', adminController.getSystemConfigs);
adminRouter.patch('/config/:key', adminController.updateSystemConfig);
