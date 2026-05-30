import { Request, Response } from 'express';
import { officersService } from './officers.service';
import { sendSuccess, sendError } from '../../utils/response';

export const officersController = {
  async list(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);
      const search = req.query.search as string | undefined;
      const officers = await officersService.getAgencyOfficers(agencyId, search);
      return sendSuccess(res, officers);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const officer = await officersService.getOfficerById(req.params.id);
      return sendSuccess(res, officer);
    } catch (err: any) {
      return sendError(res, err.message || 'Officer not found', err.statusCode || 500);
    }
  },

  async toggleDuty(req: Request, res: Response) {
    try {
      const officer = await officersService.toggleDuty(req.params.id);
      return sendSuccess(res, officer);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async updateLocation(req: Request, res: Response) {
    try {
      const { lat, lng } = req.body;
      if (lat === undefined || lng === undefined) {
        return sendError(res, 'lat and lng are required', 400);
      }
      const officer = await officersService.updateLocation(req.params.id, lat, lng);
      return sendSuccess(res, officer);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
