import { Request, Response } from 'express';
import { resourcesService } from './resources.service';
import { sendSuccess, sendError } from '../../utils/response';
import { ResourceStatus } from '@prisma/client';

export const resourcesController = {
  async list(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);
      const resources = await resourcesService.getAgencyResources(agencyId);
      return sendSuccess(res, resources);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return sendError(res, 'status is required', 400);
      if (!Object.values(ResourceStatus).includes(status as ResourceStatus)) {
        return sendError(res, `Invalid status. Must be one of: ${Object.values(ResourceStatus).join(', ')}`, 400);
      }
      const resource = await resourcesService.updateStatus(req.params.id, status as ResourceStatus);
      return sendSuccess(res, resource);
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
      const resource = await resourcesService.updateLocation(req.params.id, lat, lng);
      return sendSuccess(res, resource);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
