import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendError } from '../utils/response';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  phone: string;
  role: Role;
  isAnonymous: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((pair) => {
    const [key, ...rest] = pair.trim().split('=');
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Fallback to httpOnly cookie
  if (!token) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.accessToken;
  }

  if (!token) {
    return sendError(res, 'No token provided', 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
}
