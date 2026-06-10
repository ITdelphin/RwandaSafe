import { Request, Response } from 'express';
import { slaService } from './sla.service';
import { sendSuccess, sendError } from '../../utils/response';

export const slaController = {
  async getSlaConfigs(_req: Request, res: Response) {
    try {
      const configs = await slaService.getSlaConfigs();
      return sendSuccess(res, configs);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async updateSlaConfig(req: Request, res: Response) {
    try {
      const { targetMinutes, warningMinutes } = req.body;
      if (targetMinutes === undefined || warningMinutes === undefined) {
        return sendError(res, 'targetMinutes and warningMinutes are required', 400);
      }
      const config = await slaService.updateSlaConfig(req.params.id, targetMinutes, warningMinutes, req.user!.id);
      return sendSuccess(res, config);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getSlaBreachReport(req: Request, res: Response) {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const agencyType = req.query.agency as string | undefined;
      const report = await slaService.getSlaBreachReport(from, to, agencyType);
      return sendSuccess(res, report);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
