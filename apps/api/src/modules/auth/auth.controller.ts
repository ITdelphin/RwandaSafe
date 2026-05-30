import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export const authController = {
  // Email/password (dashboards)
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginWithPassword(req.body.email, req.body.password);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return sendCreated(res, result);
    } catch (err) { next(err); }
  },
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  // OTP (citizen app)
  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestOtp(req.body.phone, req.body.name);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyOtpAndLogin(req.body.phone, req.body.code);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshAccessToken(req.body.refreshToken);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.refreshToken) await authService.logout(req.body.refreshToken);
      return sendSuccess(res, { message: 'Logged out' });
    } catch (err) { next(err); }
  },
};
