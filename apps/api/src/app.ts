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
import { dashboardRouter } from './modules/dashboard/dashboard.router';
import { officersRouter } from './modules/officers/officers.router';
import { resourcesRouter } from './modules/resources/resources.router';
import { medicalRouter } from './modules/medical/medical.router';
import { ambulanceRouter } from './modules/medical/ambulance.router';
import { capacityRouter } from './modules/capacity/capacity.router';
import { fireRouter } from './modules/fire/fire.router';
import { investigationRouter } from './modules/investigation/investigation.router';
import { patternRouter } from './modules/investigation/pattern.router';
import { tiplineRouter } from './modules/tipline/tipline.router';

export const app = express();

// Trust Railway/Vercel reverse proxy
app.set('trust proxy', 1);

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
app.use('/v1/dashboard', dashboardRouter);
app.use('/v1/officers', officersRouter);
app.use('/v1/resources', resourcesRouter);
app.use('/v1/medical', medicalRouter);
app.use('/v1/ambulances', ambulanceRouter);
app.use('/v1/capacity', capacityRouter);
app.use('/v1/fire', fireRouter);
app.use('/v1/investigations', investigationRouter);
app.use('/v1/patterns', patternRouter);
app.use('/v1/tips', tiplineRouter);

app.use(notFound);
app.use(errorHandler);
