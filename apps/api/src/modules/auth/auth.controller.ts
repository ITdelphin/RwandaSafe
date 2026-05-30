import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestOtp(req.body.phone, req.body.name);
      return sendCreated(res, result);
    } catch (err) {
      next(err);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyOtpAndLogin(req.body.phone, req.body.code);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestOtp(req.body.phone);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshAccessToken(req.body.refreshToken);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },
};
