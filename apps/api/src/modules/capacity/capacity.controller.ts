import { Request, Response } from 'express';
import { capacityService } from './capacity.service';
import { sendSuccess, sendError } from '../../utils/response';
import { socketEmit } from '../../socket/socket';

export const capacityController = {
  async getAllCapacity(req: Request, res: Response) {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const result = await capacityService.getAllHospitalsCapacity(lat, lng);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getCapacity(req: Request, res: Response) {
    try {
      const result = await capacityService.getHospitalCapacity(req.params.agencyId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async updateCapacity(req: Request, res: Response) {
    try {
      const { agencyId } = req.params;
      const result = await capacityService.updateCapacity(agencyId, req.body, req.user!.id);
      socketEmit.capacityUpdated(result);

      // Emit critical alert if beds are critically low
      const emergencyLow = result.emergencyBedsAvail <= 2;
      const icuLow = result.icuBedsAvail <= 1;
      if (emergencyLow || icuLow) {
        const msg = [
          emergencyLow ? `Emergency beds critically low (${result.emergencyBedsAvail} left)` : '',
          icuLow ? `ICU beds critically low (${result.icuBedsAvail} left)` : '',
        ]
          .filter(Boolean)
          .join('; ');
        socketEmit.capacityCritical(result.agency.name, msg);
      }

      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async releaseBed(req: Request, res: Response) {
    try {
      const { agencyId } = req.params;
      const { bedType } = req.body;
      if (!bedType || !['emergency', 'icu'].includes(bedType)) {
        return sendError(res, 'bedType must be "emergency" or "icu"', 400);
      }
      const result = await capacityService.releaseBed(agencyId, bedType as 'emergency' | 'icu');
      socketEmit.capacityUpdated(result);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
