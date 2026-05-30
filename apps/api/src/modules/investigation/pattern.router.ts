import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { agencyGuard } from '../../middleware/agencyGuard';
import { prisma } from '../../config/database';
import { investigationService } from './investigation.service';
import { sendSuccess, sendError } from '../../utils/response';
import { socketEmit } from '../../socket/socket';

export const patternRouter = Router();

patternRouter.use(requireAuth);
patternRouter.use(agencyGuard);

// GET /v1/patterns/alerts — list unreviewed PatternAlerts
patternRouter.get('/alerts', async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [alerts, total] = await prisma.$transaction([
      prisma.patternAlert.findMany({
        where: { isReviewed: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.patternAlert.count({ where: { isReviewed: false } }),
    ]);

    return sendSuccess(res, alerts, 200, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err: any) {
    return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
  }
});

// PATCH /v1/patterns/:id/review — mark a pattern alert as reviewed
patternRouter.patch('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await prisma.patternAlert.findUnique({ where: { id } });
    if (!alert) return sendError(res, 'Pattern alert not found', 404);

    const updated = await prisma.patternAlert.update({
      where: { id },
      data: { isReviewed: true, reviewedById: req.user!.id },
    });

    return sendSuccess(res, updated);
  } catch (err: any) {
    return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
  }
});

// POST /v1/patterns/run — trigger pattern detection
patternRouter.post('/run', async (req, res) => {
  try {
    const result = await investigationService.runPatternDetection();

    // Emit socket event for each new pattern alert
    for (const alert of result.alerts) {
      socketEmit.patternAlert(alert);
    }

    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
  }
});
