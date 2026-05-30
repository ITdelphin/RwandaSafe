import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const extras = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
            return `${timestamp} [${level}] ${message}${extras}`;
          })
        )
  ),
  transports: [new winston.transports.Console()],
});

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    logger.http(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}
