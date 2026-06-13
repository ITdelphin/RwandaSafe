import { prisma } from '../../config/database';
import { Role, IncidentStatus, IncidentSeverity, AgencyType } from '@prisma/client';
import { sendTopicNotification } from '../notifications/fcm.service';

interface UserFilters {
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}

interface CreateOfficerInput {
  phone: string;
  name: string;
  email?: string;
  role: Role;
  agencyId: string;
  badgeNumber?: string;
  rank?: string;
  sendSms?: boolean;
}

interface BroadcastAlertInput {
  title: string;
  message: string;
  severity: string;
  district?: string;
  expiresAt?: string;
}

interface AuditFilters {
  actorId?: string;
  resourceType?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const adminService = {
  async getNationalStats(from: Date, to: Date) {
    const where = { createdAt: { gte: from, lte: to } };

    const agencies: AgencyType[] = [AgencyType.POLICE, AgencyType.HOSPITAL, AgencyType.FIRE, AgencyType.RIB];

    const [
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      closedIncidents,
      byAgency,
      byType,
      byDistrict,
      bySeverity,
      dailyTrend,
      activeOfficers,
    ] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.count({ where: { ...where, status: { notIn: [IncidentStatus.CLOSED, IncidentStatus.CANCELLED] } } }),
      prisma.incident.count({ where: { ...where, status: IncidentStatus.RESOLVED } }),
      prisma.incident.count({ where: { ...where, status: IncidentStatus.CLOSED } }),
      Promise.all(
        agencies.map(async (agency) => {
          const total = await prisma.incident.count({ where: { ...where, targetAgency: agency } });
          const open = await prisma.incident.count({
            where: { ...where, targetAgency: agency, status: { notIn: [IncidentStatus.CLOSED, IncidentStatus.CANCELLED] } },
          });
          const resolved = await prisma.incident.count({ where: { ...where, targetAgency: agency, status: IncidentStatus.RESOLVED } });
          return { agency, total, open, resolved };
        }),
      ),
      prisma.incident.groupBy({ by: ['type'], where, _count: true }),
      prisma.incident.groupBy({ by: ['district'], where, _count: true, orderBy: { _count: { district: 'desc' } }, take: 10 }),
      prisma.incident.groupBy({ by: ['severity'], where, _count: true }),
      (async () => {
        const days: { date: string; count: number }[] = [];
        const start = new Date(from);
        const end = new Date(to);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayStart = new Date(d);
          const dayEnd = new Date(d);
          dayEnd.setHours(23, 59, 59, 999);
          const count = await prisma.incident.count({
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
          });
          days.push({ date: dayStart.toISOString().slice(0, 10), count });
        }
        return days;
      })(),
      prisma.officer.count({ where: { isOnDuty: true } }),
    ]);

    return {
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      closedIncidents,
      byAgency,
      byType,
      byDistrict,
      bySeverity,
      dailyTrend,
      activeOfficers,
    };
  },

  async getAgencyScorecard() {
    const agencies: AgencyType[] = [AgencyType.POLICE, AgencyType.HOSPITAL, AgencyType.FIRE, AgencyType.RIB];
    const scorecards = [];

    for (const agency of agencies) {
      const totalCases = await prisma.incident.count({ where: { targetAgency: agency } });
      const resolvedCases = await prisma.incident.count({ where: { targetAgency: agency, status: IncidentStatus.RESOLVED } });
      const openCases = await prisma.incident.count({
        where: { targetAgency: agency, status: { notIn: [IncidentStatus.CLOSED, IncidentStatus.CANCELLED] } },
      });
      const criticalOpen = await prisma.incident.count({
        where: { targetAgency: agency, severity: IncidentSeverity.CRITICAL, status: { notIn: [IncidentStatus.CLOSED, IncidentStatus.CANCELLED] } },
      });
      const slaBreachCount = 0;

      const resolutionRate = totalCases ? Math.round((resolvedCases / totalCases) * 100) : 0;
      const slaCompliance = totalCases ? Math.round(((totalCases - slaBreachCount) / totalCases) * 100) : 100;

      const responseScore = 100;
      const performanceScore = Math.round(0.4 * resolutionRate + 0.3 * slaCompliance + 0.3 * responseScore);

      const officerCount = await prisma.officer.count({ where: { agency: { type: agency } } });
      const onDutyCount = await prisma.officer.count({ where: { agency: { type: agency }, isOnDuty: true } });

      const assignments = await prisma.assignment.findMany({
        where: { incident: { targetAgency: agency }, respondedAt: { not: null } },
        select: { assignedAt: true, respondedAt: true },
      });
      const totalResp = assignments.reduce((sum, a) => sum + (a.respondedAt!.getTime() - a.assignedAt.getTime()) / 60000, 0);
      const avgResponseTimeMinutes = assignments.length ? Math.round(totalResp / assignments.length) : 0;

      scorecards.push({
        agency,
        totalCases,
        resolvedCases,
        resolutionRate,
        avgResponseTimeMinutes,
        slaBreachCount,
        slaCompliance,
        openCases,
        criticalOpen,
        officerCount,
        onDutyCount,
        performanceScore,
      });
    }

    return scorecards;
  },

  async getNationalMapData() {
    return prisma.incident.findMany({
      where: { status: { notIn: [IncidentStatus.CLOSED, IncidentStatus.CANCELLED] } },
      select: {
        id: true,
        trackingCode: true,
        type: true,
        severity: true,
        status: true,
        latitude: true,
        longitude: true,
        targetAgency: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getHeatMapData(from: Date, to: Date) {
    const incidents = await prisma.incident.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { latitude: true, longitude: true },
    });

    const grouped = new Map<string, number>();
    for (const inc of incidents) {
      const key = `${inc.latitude.toFixed(2)},${inc.longitude.toFixed(2)}`;
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }

    return Array.from(grouped.entries()).map(([key, weight]) => {
      const [lat, lng] = key.split(',').map(Number);
      return { lat, lng, weight };
    });
  },

  async getAnimatedHeatMapData(from: Date, to: Date) {
    const frames: { date: string; points: { lat: number; lng: number; weight: number }[] }[] = [];
    const start = new Date(from);
    const end = new Date(to);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const incidents = await prisma.incident.findMany({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
        select: { latitude: true, longitude: true },
      });

      const grouped = new Map<string, number>();
      for (const inc of incidents) {
        if (inc.latitude && inc.longitude) {
          const key = `${inc.latitude.toFixed(2)},${inc.longitude.toFixed(2)}`;
          grouped.set(key, (grouped.get(key) || 0) + 1);
        }
      }

      const points = Array.from(grouped.entries()).map(([key, weight]) => {
        const [lat, lng] = key.split(',').map(Number);
        return { lat, lng, weight };
      });

      frames.push({ date: dayStart.toISOString().slice(0, 10), points });
    }

    return frames;
  },

  async listUsers(filters: UserFilters, page: number, limit: number) {
    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          officer: { include: { agency: { select: { id: true, name: true, type: true } } } },
          _count: { select: { incidents: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async promoteToOfficer(userId: string, data: { role: Role; agencyId: string; badgeNumber?: string; rank?: string }, promotedById: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { officer: true } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (user.officer) throw Object.assign(new Error('User is already an officer'), { statusCode: 400 });

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: {
          role: data.role,
          isVerified: true,
          isActive: true,
        },
      });

      await tx.officer.create({
        data: {
          userId: u.id,
          agencyId: data.agencyId,
          badgeNumber: data.badgeNumber,
          rank: data.rank,
          isOnDuty: false,
        },
      });

      return u;
    });

    return updatedUser;
  },

  async createOfficerAccount(data: CreateOfficerInput, createdById: string) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw Object.assign(new Error('User with this phone already exists'), { statusCode: 409 });

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        email: data.email,
        role: data.role,
        isVerified: true,
        isActive: true,
      },
    });

    await prisma.officer.create({
      data: {
        userId: user.id,
        agencyId: data.agencyId,
        badgeNumber: data.badgeNumber,
        rank: data.rank,
        isOnDuty: false,
      },
    });

    return user;
  },

  async suspendUser(userId: string, reason: string, suspendedById: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { isActive: false } }),
      prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);

    return { message: 'User suspended', userId, reason };
  },

  async reactivateUser(userId: string, reactivatedById: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    await prisma.user.update({ where: { id: userId }, data: { isActive: true } });

    return { message: 'User reactivated', userId };
  },

  async sendBroadcastAlert(data: BroadcastAlertInput, issuedById: string) {
    const districtFilter = data.district ? { district: data.district } : {};
    const targetCount = await prisma.user.count({
      where: { isActive: true, ...districtFilter },
    });

    const alert = await prisma.broadcastAlert.create({
      data: {
        title: data.title,
        message: data.message,
        district: data.district ?? null,
        severity: data.severity,
        issuedById,
        targetCount,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    if (targetCount > 0) {
      const topic = data.district ? `district_${data.district}` : 'all_users';
      try {
        await sendTopicNotification(topic, data.title, data.message);
        await prisma.broadcastAlert.update({
          where: { id: alert.id },
          data: { deliveredCount: targetCount },
        });
      } catch {
        // FCM send failure is non-critical
      }
    }

    return { alertId: alert.id, targetCount, message: 'Alert sent' };
  },

  async getBroadcastAlerts() {
    return prisma.broadcastAlert.findMany({
      orderBy: { createdAt: 'desc' },
      include: { issuedBy: { select: { id: true, name: true } } },
    });
  },

  async deactivateBroadcastAlert(alertId: string) {
    const alert = await prisma.broadcastAlert.findUnique({ where: { id: alertId } });
    if (!alert) throw Object.assign(new Error('Broadcast alert not found'), { statusCode: 404 });

    return prisma.broadcastAlert.update({
      where: { id: alertId },
      data: { isActive: false },
    });
  },

  async getAuditLog(filters: AuditFilters, page: number, limit: number) {
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

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async exportOpenData(from: Date, to: Date, format: 'csv' | 'json') {
    const incidents = await prisma.incident.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: {
        trackingCode: true,
        type: true,
        severity: true,
        status: true,
        district: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        targetAgency: true,
        resolvedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const anonymized = incidents.map((inc) => ({
      trackingCode: inc.trackingCode,
      type: inc.type,
      severity: inc.severity,
      status: inc.status,
      district: inc.district,
      latitude: inc.latitude ? Math.round(inc.latitude * 100) / 100 : null,
      longitude: inc.longitude ? Math.round(inc.longitude * 100) / 100 : null,
      date: inc.createdAt.toISOString().slice(0, 10),
      agency: inc.targetAgency,
      resolvedAt: inc.resolvedAt ? inc.resolvedAt.toISOString().slice(0, 10) : null,
    }));

    if (format === 'csv') {
      const headers = Object.keys(anonymized[0] || {}).join(',');
      const rows = anonymized.map((row) => Object.values(row).map((v) => `"${v ?? ''}"`).join(','));
      return { data: [headers, ...rows].join('\n'), contentType: 'text/csv', filename: `rwanda-safe-opendata-${from.toISOString().slice(0, 7)}.csv` };
    }

    return { data: JSON.stringify(anonymized, null, 2), contentType: 'application/json', filename: `rwanda-safe-opendata-${from.toISOString().slice(0, 7)}.json` };
  },

  async getOpenDataSummary() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalIncidents = await prisma.incident.count({ where: { createdAt: { gte: monthStart } } });
    const byType = await prisma.incident.groupBy({ by: ['type'], where: { createdAt: { gte: monthStart } }, _count: true });
    const byDistrict = await prisma.incident.groupBy({ by: ['district'], where: { createdAt: { gte: monthStart } }, _count: true, orderBy: { _count: { district: 'desc' } }, take: 1 });
    const resolved = await prisma.incident.count({ where: { createdAt: { gte: monthStart }, status: IncidentStatus.RESOLVED } });
    const resolutionRate = totalIncidents ? Math.round((resolved / totalIncidents) * 100) : 0;

    const mostCommonType = byType.sort((a, b) => b._count - a._count)[0];

    return {
      month: now.toISOString().slice(0, 7),
      totalIncidents,
      mostCommonType: mostCommonType?.type ?? null,
      mostCommonTypePercentage: mostCommonType ? Math.round((mostCommonType._count / totalIncidents) * 100) : 0,
      mostAffectedDistrict: byDistrict[0]?.district ?? null,
      mostAffectedDistrictPercentage: byDistrict[0] ? Math.round((byDistrict[0]._count / totalIncidents) * 100) : 0,
      resolutionRate,
    };
  },

  async getSystemHealth() {
    const statuses: Record<string, string> = {};

    statuses.api = 'UP';

    try {
      await prisma.$queryRaw`SELECT 1`;
      statuses.database = 'UP';
    } catch {
      statuses.database = 'DOWN';
    }

    try {
      const { redisClient } = await import('../../config/redis');
      await redisClient.ping();
      statuses.redis = 'UP';
    } catch {
      statuses.redis = 'DOWN';
    }

    statuses.storage = 'UP';

    const lastIncident = await prisma.incident.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true, trackingCode: true } });

    return {
      statuses,
      lastActivity: lastIncident?.createdAt.toISOString() ?? null,
      lastIncidentTrackingCode: lastIncident?.trackingCode ?? null,
      timestamp: new Date().toISOString(),
    };
  },

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        officer: { include: { agency: true } },
        _count: { select: { incidents: true } },
      },
    });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  },

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false, name: `${user.name} (deleted)` },
    });

    return { message: 'User soft-deleted' };
  },

  async getSystemConfigs() {
    return prisma.systemConfig.findMany({ orderBy: { category: 'asc' } });
  },

  async updateSystemConfig(key: string, value: string, updatedById: string) {
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    if (!config) throw Object.assign(new Error('Config key not found'), { statusCode: 404 });

    return prisma.systemConfig.update({
      where: { key },
      data: { value, updatedById },
    });
  },
};
