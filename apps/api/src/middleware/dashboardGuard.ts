import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';
import { DashboardType } from '@prisma/client';

/**
 * Verifies the authenticated user has active access to the requested dashboard.
 * The dashboard type is read from a header: X-Dashboard-Type
 * (sent by each frontend app based on which dashboard it is).
 */
export async function dashboardGuard(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role === 'SUPER_ADMIN') return next(); // Admin always passes

    const dashboardType = req.headers['x-dashboard-type'] as DashboardType;
    if (!dashboardType) return sendError(res, 'Missing dashboard type header', 400);

    const access = await prisma.dashboardAccess.findUnique({
        where: { userId_dashboard: { userId: req.user!.id, dashboard: dashboardType } },
    });

    if (!access || !access.isActive) {
        return sendError(res, `You do not have access to the ${dashboardType} dashboard`, 403);
    }

    next();
}
