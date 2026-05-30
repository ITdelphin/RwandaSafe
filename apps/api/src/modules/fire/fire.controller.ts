import { Request, Response } from 'express';
import { fireService } from './fire.service';
import { sendSuccess, sendError } from '../../utils/response';
import { socketEmit } from '../../socket/socket';
import { FireIncidentType, FireUnitStatus, HazmatLevel } from '@prisma/client';

export const fireController = {
  // POST /v1/fire/:incidentId/report (also POST /v1/fire/report with incidentId in body)
  async createFireReport(req: Request, res: Response) {
    try {
      const incidentId = req.params.incidentId ?? req.body.incidentId;
      if (!incidentId) return sendError(res, 'incidentId is required', 400);

      const { fireType, hazmatLevel, chemicalInvolved, buildingType, buildingFloors, estimatedOccupancy, casualties } = req.body;

      const result = await fireService.createFireReport(
        incidentId,
        {
          fireType: fireType as FireIncidentType | undefined,
          hazmatLevel: hazmatLevel as HazmatLevel | undefined,
          chemicalInvolved,
          buildingType,
          buildingFloors: buildingFloors ? Number(buildingFloors) : undefined,
          estimatedOccupancy: estimatedOccupancy ? Number(estimatedOccupancy) : undefined,
          casualties: casualties ? Number(casualties) : undefined,
        },
        req.user!.id,
      );

      // Alert FIRE agency if hazmat
      if (result.hazmatLevel) {
        socketEmit.fireHazmatAlert({ incidentId, hazmatLevel: result.hazmatLevel, chemicalInvolved: result.chemicalInvolved });
      }

      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // POST /v1/fire/:incidentId/dispatch
  async dispatchUnits(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { unitIds } = req.body;
      if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
        return sendError(res, 'unitIds array is required', 400);
      }

      const result = await fireService.dispatchUnits(incidentId, unitIds, req.user!.id);
      socketEmit.unitDispatched(incidentId, result);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // PATCH /v1/fire/units/:id/status
  async updateUnitStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, lat, lng } = req.body;
      if (!status) return sendError(res, 'status is required', 400);

      const result = await fireService.updateUnitStatus(
        id,
        status as FireUnitStatus,
        lat != null ? Number(lat) : undefined,
        lng != null ? Number(lng) : undefined,
      );
      socketEmit.unitUpdated(result);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/fire/:incidentId/hydrants
  async getNearestHydrants(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { lat, lng, radius } = req.query;
      if (!lat || !lng) return sendError(res, 'lat and lng are required', 400);

      const result = await fireService.getNearestHydrants(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radius ? parseInt(radius as string, 10) : undefined,
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/fire/:incidentId/weather
  async getWeatherData(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { lat, lng } = req.query;
      if (!lat || !lng) return sendError(res, 'lat and lng are required', 400);

      const result = await fireService.getWeatherData(
        parseFloat(lat as string),
        parseFloat(lng as string),
        incidentId,
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/fire/chemicals?q=LPG
  async lookupChemical(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q) return sendError(res, 'q (search query) is required', 400);
      const result = fireService.lookupChemical(q as string);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // POST /v1/fire/:incidentId/post-report
  async submitPostIncidentReport(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const { report } = req.body;
      if (!report) return sendError(res, 'report text is required', 400);

      const result = await fireService.submitPostIncidentReport(incidentId, report, req.user!.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/fire/units
  async getFireUnits(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);
      const result = await fireService.getFireUnits(agencyId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/fire/units/available
  async getAvailableUnits(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);
      const result = await fireService.getAvailableUnits(agencyId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/fire/reports
  async getFireReports(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);

      const { page, limit, fireType, hazmatLevel } = req.query;
      const result = await fireService.getFireReports(agencyId, {
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        fireType: fireType as FireIncidentType | undefined,
        hazmatLevel: hazmatLevel as HazmatLevel | undefined,
      });

      return sendSuccess(res, result.reports, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
