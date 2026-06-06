import { prisma } from '../../config/database';
import { IncidentStatus } from '@prisma/client';

export const statsService = {
  async getPublicStats() {
    const [
      totalIncidents,
      resolvedIncidents,
      activeIncidents,
      todayIncidents,
      avgResponseRaw,
    ] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({
        where: { status: { in: [IncidentStatus.RESOLVED, IncidentStatus.CLOSED] } },
      }),
      prisma.incident.count({
        where: {
          status: {
            in: [
              IncidentStatus.RECEIVED,
              IncidentStatus.UNDER_REVIEW,
              IncidentStatus.ASSIGNED,
              IncidentStatus.DISPATCHED,
              IncidentStatus.ON_SCENE,
            ],
          },
        },
      }),
      prisma.incident.count({
        where: { createdAt: { gte: (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })() } },
      }),
      prisma.incident.findMany({
        where: {
          statusHistory: { some: { newStatus: IncidentStatus.DISPATCHED } },
        },
        select: {
          createdAt: true,
          statusHistory: {
            where: { newStatus: IncidentStatus.DISPATCHED },
            orderBy: { changedAt: 'asc' },
            take: 1,
            select: { changedAt: true },
          },
        },
        take: 200,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const responseTimes: number[] = [];
    for (const inc of avgResponseRaw) {
      const dispatch = inc.statusHistory[0];
      if (dispatch) {
        const diffMin =
          (new Date(dispatch.changedAt).getTime() - new Date(inc.createdAt).getTime()) / 60000;
        if (diffMin > 0 && diffMin < 120) responseTimes.push(diffMin);
      }
    }
    const avgResponseMinutes =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : null;

    return {
      totalIncidents,
      resolvedIncidents,
      activeIncidents,
      todayIncidents,
      avgResponseMinutes,
      resolutionRate:
        totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : null,
    };
  },
};
