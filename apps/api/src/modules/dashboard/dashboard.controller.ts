import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess, sendError } from '../../utils/response';
import { prisma } from '../../config/database';
import { AgencyType } from '@prisma/client';

export const dashboardController = {
  async getIncidents(req: Request, res: Response) {
    try {
      const agencyType = (req.query.agencyType as AgencyType) || (req as any).agency?.type;
      if (!agencyType) return sendError(res, 'Agency type required', 400);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        status: req.query.status as string,
        type: req.query.type as string,
        severity: req.query.severity as string,
        district: req.query.district as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        search: req.query.search as string,
      };
      const result = await dashboardService.getAgencyIncidents(agencyType, filters, page, limit);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getMapData(req: Request, res: Response) {
    try {
      const agencyType = (req.query.agencyType as AgencyType) || (req as any).agency?.type;
      if (!agencyType) return sendError(res, 'Agency type required', 400);
      const data = await dashboardService.getIncidentMapData(agencyType);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const agencyType = (req.query.agencyType as AgencyType) || (req as any).agency?.type;
      if (!agencyType) return sendError(res, 'Agency type required', 400);
      const stats = await dashboardService.getAgencyStats(agencyType);
      return sendSuccess(res, stats);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getOfficers(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);
      const officers = await dashboardService.getOnDutyOfficers(agencyId);
      return sendSuccess(res, officers);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async forwardIncident(req: Request, res: Response) {
    try {
      const { incidentId, targetAgency, note } = req.body;
      const fromAgency = (req as any).agency?.type;
      if (!incidentId || !targetAgency) return sendError(res, 'incidentId and targetAgency required', 400);
      const result = await dashboardService.forwardToAgency(
        incidentId,
        targetAgency,
        req.user!.id,
        fromAgency,
        note,
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async createHandover(req: Request, res: Response) {
    try {
      const officer = (req as any).officer;
      if (!officer) return sendError(res, 'Officer profile required', 403);
      const { summary } = req.body;
      if (!summary) return sendError(res, 'Summary required', 400);
      const result = await dashboardService.createShiftHandover(officer.id, summary);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getLatestHandover(req: Request, res: Response) {
    try {
      const officer = (req as any).officer;
      if (!officer) return sendError(res, 'Officer profile required', 403);
      const handover = await prisma.shiftHandover.findFirst({
        where: { officerId: officer.id },
        orderBy: { createdAt: 'desc' },
      });
      return sendSuccess(res, handover);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
