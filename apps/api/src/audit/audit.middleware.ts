import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export function auditLogger(req: Request, res: Response, next: NextFunction) {
    const skipPaths = ['/health', '/v1/auth', '/v1/tips'];
    const skipMethods = ['GET', 'OPTIONS', 'HEAD'];

    next();

    res.on('finish', async () => {
        if (skipMethods.includes(req.method)) return;
        if (skipPaths.some(p => req.path.startsWith(p))) return;
        if (res.statusCode >= 400) return;

        const pathParts = req.path.split('/').filter(Boolean);
        const resourceType = pathParts[1] ?? 'unknown';
        const resourceId = pathParts[2] ?? null;

        try {
            await prisma.auditLog.create({
                data: {
                    actorId: req.user?.id ?? null,
                    actorRole: req.user?.role ?? null,
                    action: `${req.method} ${req.path}`,
                    resourceType,
                    resourceId,
                    newValue: ['POST', 'PATCH', 'PUT'].includes(req.method) ? req.body : null,
                    ipAddress: req.ip ?? '',
                    userAgent: req.headers['user-agent'] ?? null,
                },
            });
        } catch {
            // Never crash the server for an audit log failure
        }
    });
}
