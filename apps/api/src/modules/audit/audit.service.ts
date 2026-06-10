import { prisma } from '../../config/database';

export const auditService = {
  async getAuditLogs(filters: {
    actorId?: string;
    resourceType?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }, page = 1, limit = 50) {
    const where: any = {};

    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.resourceType) where.resourceType = filters.resourceType;
    if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};
