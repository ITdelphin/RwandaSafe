import { Request, Response } from 'express';
import { opendataService } from './opendata.service';
import { sendSuccess, sendError } from '../../utils/response';

export const opendataController = {
  async exportData(req: Request, res: Response) {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const format = (req.query.format as string) === 'json' ? 'json' : 'csv';
      const result = await opendataService.exportData(from, to, format);
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.send(result.data);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },

  async getPublicSummary(_req: Request, res: Response) {
    try {
      const summary = await opendataService.getPublicSummary();
      return sendSuccess(res, summary);
    } catch (err: any) {
      return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
    }
  },
};
