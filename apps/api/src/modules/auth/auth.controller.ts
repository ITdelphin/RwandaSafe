import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { prisma } from '../../config/database';

export const authController = {
  // Citizen Phone OTP
  async sendPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.sendPhoneOtp(req.body.phone, req.body.name, req.body.lang);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  async verifyPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyPhoneOtp(req.body.phone, req.body.code);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  // Citizen Email OTP
  async sendEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.sendEmailOtp(req.body.email, req.body.name, req.body.lang);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  async verifyEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyEmailOtp(req.body.email, req.body.code);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  // Guest Session
  async createGuestSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.createGuestSession(req.body.lang);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  // Officer OTP (Portal)
  async sendOfficerOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.sendOfficerOtp(req.body.phone);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  async verifyOfficerOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyOfficerOtp(req.body.phone, req.body.code);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  // Shared Token Logic
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
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { officer: true }
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return sendSuccess(res, { ...authService.toPublicUser(user), officer: user.officer });
    } catch (err) { next(err); }
  },

  // Legacy Password
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
};
