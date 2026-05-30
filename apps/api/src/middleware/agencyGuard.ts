import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';

export async function agencyGuard(req: Request, res: Response, next: NextFunction) {
  // Try to attach officer+agency for all roles (including SUPER_ADMIN if they have a profile)
  const officer = await prisma.officer.findUnique({
    where: { userId: req.user!.id },
    include: { agency: true },
  });

  if (officer) {
    (req as any).officer = officer;
    (req as any).agency = officer.agency;
  }

  // SUPER_ADMIN can proceed even without an officer profile
  if (req.user?.role === 'SUPER_ADMIN') return next();

  if (!officer) return sendError(res, 'Officer profile not found', 403);

  next();
}
