import { Request, Response, NextFunction } from 'express';
import { mediaService } from './media.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export const mediaController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });
      const media = await mediaService.uploadMedia(req.params.id, req.file, req.user!.id);
      return sendCreated(res, media);
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.getIncidentMedia(req.params.id);
      return sendSuccess(res, media);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await mediaService.deleteMedia(req.params.mediaId, req.user!.id);
      return sendSuccess(res, { deleted: true });
    } catch (err) { next(err); }
  },
};
