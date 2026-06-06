import { Request, Response, NextFunction } from 'express';
import { statsService } from './stats.service';

export const statsController = {
  async getPublicStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getPublicStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },
};
