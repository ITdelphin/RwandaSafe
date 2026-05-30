import { Request, Response } from 'express';
import { tiplineService } from './tipline.service';
import { sendSuccess, sendError } from '../../utils/response';

export const tiplineController = {
  // POST /v1/tips — no auth required
  async submitTip(req: Request, res: Response) {
    try {
      const { content, investigationId, submitterPhone, isAnonymous } = req.body;
      if (!content) return sendError(res, 'content is required', 400);

      // IMPORTANT: We NEVER log or use req.ip here to protect tipster anonymity.
      const result = await tiplineService.submitTip({
        content,
        investigationId,
        submitterPhone,
        isAnonymous: isAnonymous !== false, // default to anonymous
      });

      return sendSuccess(res, { id: result.id, received: true }, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // GET /v1/tips — requires auth (RIB)
  async getTips(req: Request, res: Response) {
    try {
      const { page, limit, investigationId } = req.query;
      const result = await tiplineService.getUnreviewedTips({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        investigationId: investigationId as string | undefined,
      });

      return sendSuccess(res, result.tips, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  // PATCH /v1/tips/:id/review — requires auth (RIB)
  async reviewTip(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isCredible, reviewNotes } = req.body;
      if (isCredible === undefined) return sendError(res, 'isCredible is required', 400);

      const result = await tiplineService.reviewTip(id, req.user!.id, Boolean(isCredible), reviewNotes);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
