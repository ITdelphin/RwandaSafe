import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendError, sendCreated } from '../../utils/response';

export const adminController = {
  async getNationalStats(req: Request, res: Response) {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const stats = await adminService.getNationalStats(from, to);
      return sendSuccess(res, stats);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getAgencyScorecard(req: Request, res: Response) {
    try {
      const scorecards = await adminService.getAgencyScorecard();
      return sendSuccess(res, scorecards);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getNationalMapData(req: Request, res: Response) {
    try {
      const data = await adminService.getNationalMapData();
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getHeatMapData(req: Request, res: Response) {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const data = await adminService.getHeatMapData(from, to);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getAnimatedHeatMapData(req: Request, res: Response) {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const data = await adminService.getAnimatedHeatMapData(from, to);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async listUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        role: req.query.role as string | undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        isVerified: req.query.isVerified !== undefined ? req.query.isVerified === 'true' : undefined,
        search: req.query.search as string | undefined,
      };
      const result = await adminService.listUsers(filters, page, limit);
      return sendSuccess(res, result.users, 200, { page, limit, total: result.total, totalPages: result.totalPages });
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async createOfficerAccount(req: Request, res: Response) {
    try {
      const user = await adminService.createOfficerAccount(req.body, req.user!.id);
      return sendCreated(res, { user, message: 'Officer account created' });
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async promoteToOfficer(req: Request, res: Response) {
    try {
      const { role, agencyId, badgeNumber, rank } = req.body;
      if (!role || !agencyId) return sendError(res, 'role and agencyId are required', 400);
      const user = await adminService.promoteToOfficer(req.params.id, { role, agencyId, badgeNumber, rank }, req.user!.id);
      return sendSuccess(res, { user, message: 'User promoted to officer' });
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async suspendUser(req: Request, res: Response) {
    try {
      const { reason } = req.body;
      if (!reason) return sendError(res, 'Reason is required', 400);
      const result = await adminService.suspendUser(req.params.id, reason, req.user!.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async reactivateUser(req: Request, res: Response) {
    try {
      const result = await adminService.reactivateUser(req.params.id, req.user!.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const result = await adminService.deleteUser(req.params.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getUserDetail(req: Request, res: Response) {
    try {
      const user = await adminService.getUserDetail(req.params.id);
      return sendSuccess(res, user);
    } catch (err: any) {
      return sendError(res, err.message || 'User not found', err.statusCode || 500);
    }
  },

  async sendBroadcastAlert(req: Request, res: Response) {
    try {
      const { title, message, severity, district, expiresAt } = req.body;
      if (!title || !message || !severity) {
        return sendError(res, 'title, message, and severity are required', 400);
      }
      const result = await adminService.sendBroadcastAlert(
        { title, message, severity, district, expiresAt },
        req.user!.id,
      );
      return sendCreated(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getBroadcastAlerts(req: Request, res: Response) {
    try {
      const alerts = await adminService.getBroadcastAlerts();
      return sendSuccess(res, alerts);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async deactivateBroadcastAlert(req: Request, res: Response) {
    try {
      const result = await adminService.deactivateBroadcastAlert(req.params.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getAuditLog(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const filters = {
        actorId: req.query.actorId as string | undefined,
        resourceType: req.query.resourceType as string | undefined,
        action: req.query.action as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
      };
      const result = await adminService.getAuditLog(filters, page, limit);
      return sendSuccess(res, result.logs, 200, { page, limit, total: result.total, totalPages: result.totalPages });
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getSystemHealth(req: Request, res: Response) {
    try {
      const health = await adminService.getSystemHealth();
      return sendSuccess(res, health);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getSystemConfigs(req: Request, res: Response) {
    try {
      const configs = await adminService.getSystemConfigs();
      return sendSuccess(res, configs);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async updateSystemConfig(req: Request, res: Response) {
    try {
      const { value } = req.body;
      if (value === undefined) return sendError(res, 'value is required', 400);
      const config = await adminService.updateSystemConfig(req.params.key, value, req.user!.id);
      return sendSuccess(res, config);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
