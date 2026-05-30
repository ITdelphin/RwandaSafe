import { Request, Response, NextFunction } from 'express';
import { incidentsService } from './incidents.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';

export const incidentsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const reporterId = req.user?.id ?? null;
      const incident = await incidentsService.createIncident(req.body, reporterId);
      return sendCreated(res, incident);
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await incidentsService.listIncidents(
        req.query, req.user!.id, req.user!.role
      );
      return sendSuccess(res, result.incidents, 200, result.meta);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const incident = await incidentsService.getIncidentById(
        req.params.id, req.user!.id, req.user!.role
      );
      return sendSuccess(res, incident);
    } catch (err) { next(err); }
  },

  async track(req: Request, res: Response, next: NextFunction) {
    try {
      const incident = await incidentsService.getIncidentByTrackingCode(req.params.trackingCode);
      return sendSuccess(res, incident);
    } catch (err) { next(err); }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const incident = await incidentsService.updateStatus(
        req.params.id, req.body, req.user!.id
      );
      return sendSuccess(res, incident);
    } catch (err) { next(err); }
  },

  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await incidentsService.assignIncident(
        req.params.id, req.body, req.user!.id
      );
      return sendSuccess(res, assignment);
    } catch (err) { next(err); }
  },

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const note = await incidentsService.addNote(
        req.params.id, req.user!.id, req.body.note, req.body.isInternal ?? false
      );
      return sendCreated(res, note);
    } catch (err) { next(err); }
  },

  async getNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const notes = await incidentsService.getNotes(req.params.id, req.user!.role);
      return sendSuccess(res, notes);
    } catch (err) { next(err); }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await incidentsService.getStatusHistory(req.params.id);
      return sendSuccess(res, history);
    } catch (err) { next(err); }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const incident = await incidentsService.cancelIncident(req.params.id, req.user!.id);
      return sendSuccess(res, incident);
    } catch (err) { next(err); }
  },

  async feedback(req: Request, res: Response, next: NextFunction) {
    try {
      const fb = await incidentsService.submitFeedback(
        req.params.id, req.user!.id, req.body.rating, req.body.comment
      );
      return sendCreated(res, fb);
    } catch (err) { next(err); }
  },
};
