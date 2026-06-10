import { prisma } from '../../config/database';
import { getIo } from '../../socket/socket';

export const slaService = {
  async getSlaConfigs() {
    return prisma.slaConfig.findMany({
      orderBy: [{ agencyType: 'asc' }, { severity: 'asc' }],
    });
  },

  async updateSlaConfig(id: string, targetMinutes: number, warningMinutes: number, updatedById: string) {
    const config = await prisma.slaConfig.findUnique({ where: { id } });
    if (!config) throw Object.assign(new Error('SLA config not found'), { statusCode: 404 });

    const updated = await prisma.slaConfig.update({
      where: { id },
      data: { targetMinutes, warningMinutes, updatedById },
    });

    try {
      getIo().emit('sla:updated', updated);
    } catch {
      // Socket may not be initialized
    }

    return updated;
  },

  async getSlaBreachReport(from: Date, to: Date, agencyType?: string) {
    const where: any = {
      respondedAt: { not: null },
      incident: {
        createdAt: { gte: from, lte: to },
      },
    };

    if (agencyType) where.incident.targetAgency = agencyType;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        incident: {
          select: {
            id: true,
            trackingCode: true,
            severity: true,
            targetAgency: true,
            createdAt: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => ({
      assignmentId: a.id,
      incidentId: a.incident.id,
      trackingCode: a.incident.trackingCode,
      severity: a.incident.severity,
      agency: a.incident.targetAgency,
      createdAt: a.incident.createdAt,
      respondedAt: a.respondedAt,
      timeToRespond: Math.round((a.respondedAt!.getTime() - a.assignedAt.getTime()) / 60000),
    }));
  },
};
