import { Request, Response } from 'express';
import { investigationService } from './investigation.service';
import { sendSuccess, sendError } from '../../utils/response';
import { socketEmit } from '../../socket/socket';
import { InvestigationStatus, EvidenceType, SuspectStatus } from '@prisma/client';

export const investigationController = {
  // POST /v1/investigations
  async createInvestigation(req: Request, res: Response) {
    try {
      const { title, description, incidentId, leadInvestigatorId, classificationLevel, isSensitive } = req.body;
      if (!title) return sendError(res, 'title is required', 400);
      if (!description) return sendError(res, 'description is required', 400);

      const result = await investigationService.createInvestigation(
        { title, description, incidentId, leadInvestigatorId, classificationLevel, isSensitive },
        req.user!.id,
      );
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/investigations
  async getInvestigations(req: Request, res: Response) {
    try {
      const agencyId = (req as any).agency?.id;
      if (!agencyId) return sendError(res, 'Agency not found', 400);

      const { page, limit, status } = req.query;
      const result = await investigationService.getInvestigations(agencyId, {
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as InvestigationStatus | undefined,
      });

      return sendSuccess(res, result.investigations, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/investigations/:id
  async getInvestigation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await investigationService.getInvestigation(id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // PATCH /v1/investigations/:id/status
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      if (!status) return sendError(res, 'status is required', 400);

      const result = await investigationService.closeInvestigation(id, status as InvestigationStatus, note ?? '', req.user!.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // POST /v1/investigations/:id/link-incidents
  async linkIncidents(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { incidentIds } = req.body;
      if (!incidentIds || !Array.isArray(incidentIds) || incidentIds.length === 0) {
        return sendError(res, 'incidentIds array is required', 400);
      }

      const result = await investigationService.linkIncidents(id, incidentIds, req.user!.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // POST /v1/investigations/:id/suspects
  async addSuspect(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { alias, description, age, gender, nationality, knownAddresses, notes } = req.body;

      const result = await investigationService.addSuspect(id, {
        alias, description, age: age ? Number(age) : undefined,
        gender, nationality,
        knownAddresses: Array.isArray(knownAddresses) ? knownAddresses : [],
        notes,
      });
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // PATCH /v1/investigations/suspects/:id/status
  async updateSuspectStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      if (!status) return sendError(res, 'status is required', 400);

      const result = await investigationService.updateSuspectStatus(id, status as SuspectStatus, notes);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // POST /v1/investigations/:id/evidence
  async uploadEvidence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type, title, description, fileUrl, filePublicId, collectedAt, suspectId, isAdmissible } = req.body;
      if (!type) return sendError(res, 'type is required', 400);
      if (!title) return sendError(res, 'title is required', 400);

      const result = await investigationService.uploadEvidence(
        id,
        {
          type: type as EvidenceType,
          title,
          description,
          fileUrl,
          filePublicId,
          collectedAt: collectedAt ? new Date(collectedAt) : undefined,
          suspectId,
          isAdmissible: isAdmissible !== undefined ? Boolean(isAdmissible) : undefined,
        },
        req.user!.id,
      );
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/investigations/:id/evidence
  async getEvidence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await investigationService.getEvidence(id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/investigations/evidence/:id/url
  async getEvidenceUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await investigationService.getEvidenceSignedUrl(id, req.user!.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // POST /v1/investigations/:id/close
  async closeInvestigation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      if (!status) return sendError(res, 'status is required', 400);
      if (!note) return sendError(res, 'note is required', 400);

      const result = await investigationService.closeInvestigation(
        id,
        status as InvestigationStatus,
        note,
        req.user!.id,
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/investigations/:id/export-pdf
  async exportPdf(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const buffer = await investigationService.exportCasePdf(id, req.user!.id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="investigation-${id}.pdf"`,
        'Content-Length': buffer.length,
      });
      return res.send(buffer);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
