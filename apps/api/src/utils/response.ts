import { Response } from 'express';

interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: ApiMeta) {
  return res.status(statusCode).json({ success: true, data, meta });
}

export function sendError(res: Response, message: string, statusCode = 400, error?: string) {
  return res.status(statusCode).json({ success: false, error: error || message, message });
}

export function sendCreated<T>(res: Response, data: T) {
  return sendSuccess(res, data, 201);
}
