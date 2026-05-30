import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from './logger';

function isZodError(err: unknown): err is z.ZodError {
  return err instanceof z.ZodError;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (isZodError(err)) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.issues,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error: Error = (err as any) instanceof Error ? (err as Error) : new Error(String(err));
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
  return res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal server error' : error.message,
  });
}
