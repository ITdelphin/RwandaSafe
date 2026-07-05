import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { env } from '../../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  path: '/v1/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginWithPassword(req.body.email, req.body.password);
      res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
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

  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestOtp(req.body.phone, req.body.name);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyOtpAndLogin(req.body.phone, req.body.code);
      res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken || parseCookies(req.headers.cookie)?.refreshToken;
      if (!refreshToken) return sendSuccess(res, { accessToken: null });
      const result = await authService.refreshAccessToken(refreshToken);
      res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken || parseCookies(req.headers.cookie)?.refreshToken;
      if (refreshToken) await authService.logout(refreshToken);
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/v1/auth' });
      return sendSuccess(res, { message: 'Logged out' });
    } catch (err) { next(err); }
  },
};

function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((pair) => {
    const [key, ...rest] = pair.trim().split('=');
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}
