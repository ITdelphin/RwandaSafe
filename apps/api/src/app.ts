import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/logger';
import { globalRateLimiter } from './middleware/rateLimiter';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.router';
import { incidentsRouter } from './modules/incidents/incidents.router';
import { mediaRouter } from './modules/media/media.router';
import { deleteMediaRouter } from './modules/media/deleteRouter';

export const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    // Production Vercel URLs
    'https://rwanda-safe-citizen.vercel.app',
    'https://rwanda-safe-police.vercel.app',
    'https://rwanda-safe-hospital.vercel.app',
    'https://rwanda-safe-fire.vercel.app',
    'https://rwanda-safe-rib.vercel.app',
    'https://rwanda-safe-admin.vercel.app',
    // Local development (from env)
    env.WEB_CITIZEN_URL,
    env.DASHBOARD_POLICE_URL,
    env.DASHBOARD_HOSPITAL_URL,
    env.DASHBOARD_FIRE_URL,
    env.DASHBOARD_RIB_URL,
    env.DASHBOARD_ADMIN_URL,
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(globalRateLimiter);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'Rwanda Safe API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/v1/auth', authRouter);
app.use('/v1/incidents', incidentsRouter);
app.use('/v1/incidents', mediaRouter);
app.use('/v1/media', deleteMediaRouter);

app.use(notFound);
app.use(errorHandler);
