import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';

export async function agencyGuard(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'SUPER_ADMIN') return next();

  const officer = await prisma.officer.findUnique({
    where: { userId: req.user!.id },
    include: { agency: true },
  });

  if (!officer) return sendError(res, 'Officer profile not found', 403);

  (req as any).officer = officer;
  (req as any).agency = officer.agency;
  next();
}
