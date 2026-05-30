import { prisma } from '../../config/database';
import { AgencyType, IncidentStatus } from '@prisma/client';

export interface DashboardFilters {
  status?: string;
  type?: string;
  severity?: string;
  district?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const dashboardService = {
  async getAgencyIncidents(
    agencyType: AgencyType,
    filters: DashboardFilters,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { targetAgency: agencyType },
        { assignments: { some: { agency: { type: agencyType } } } },
      ],
    };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.severity) where.severity = filters.severity;
    if (filters.district) where.district = { contains: filters.district, mode: 'insensitive' };
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }
    if (filters.search) {
      where.AND = [
        {
          OR: [
            { description: { contains: filters.search, mode: 'insensitive' } },
            { trackingCode: { contains: filters.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [total, incidents] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        include: {
          reporter: {
            select: { id: true, name: true, phone: true },
          },
          assignments: {
            include: {
              officer: { include: { user: { select: { id: true, name: true } } } },
              agency: true,
            },
          },
          _count: { select: { media: true } },
          notes: {
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { id: true, note: true, createdAt: true, isInternal: true },
          },
        },
      }),
    ]);

    // Sort by severity in the correct order (CRITICAL first) since Prisma only sorts alphabetically
    incidents.sort((a, b) => {
      const aSev = SEVERITY_ORDER[a.severity] ?? 99;
      const bSev = SEVERITY_ORDER[b.severity] ?? 99;
      if (aSev !== bSev) return aSev - bSev;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      data: incidents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getIncidentMapData(agencyType: AgencyType) {
    const closedStatuses: IncidentStatus[] = [IncidentStatus.CLOSED, IncidentStatus.CANCELLED];

    return prisma.incident.findMany({
      where: {
        status: { notIn: closedStatuses },
        OR: [
          { targetAgency: agencyType },
          { assignments: { some: { agency: { type: agencyType } } } },
        ],
      },
      select: {
        id: true,
        trackingCode: true,
        type: true,
        severity: true,
        status: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });
  },

  async getAgencyStats(agencyType: AgencyType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openStatuses: IncidentStatus[] = [
      IncidentStatus.RECEIVED,
      IncidentStatus.UNDER_REVIEW,
      IncidentStatus.ASSIGNED,
      IncidentStatus.DISPATCHED,
      IncidentStatus.ON_SCENE,
    ];

    const agencyFilter = {
      OR: [
        { targetAgency: agencyType },
        { assignments: { some: { agency: { type: agencyType } } } },
      ],
    };

    const [
      totalToday,
      openCases,
      criticalOpen,
      resolvedToday,
      byStatusRaw,
      byTypeRaw,
      byDistrictRaw,
      todayIncidents,
    ] = await Promise.all([
      prisma.incident.count({
        where: { createdAt: { gte: today }, ...agencyFilter },
      }),
      prisma.incident.count({
        where: { status: { in: openStatuses }, ...agencyFilter },
      }),
      prisma.incident.count({
        where: { status: { in: openStatuses }, severity: 'CRITICAL', ...agencyFilter },
      }),
      prisma.incident.count({
        where: {
          status: { in: [IncidentStatus.RESOLVED, IncidentStatus.CLOSED] },
          resolvedAt: { gte: today },
          ...agencyFilter,
        },
      }),
      prisma.incident.groupBy({
        by: ['status'],
        where: agencyFilter,
        _count: { status: true },
      }),
      prisma.incident.groupBy({
        by: ['type'],
        where: agencyFilter,
        _count: { type: true },
      }),
      prisma.incident.groupBy({
        by: ['district'],
        where: { ...agencyFilter, district: { not: null } },
        _count: { district: true },
        orderBy: { _count: { district: 'desc' } },
        take: 5,
      }),
      prisma.incident.findMany({
        where: { createdAt: { gte: today }, ...agencyFilter },
        select: {
          id: true,
          createdAt: true,
          statusHistory: {
            where: { newStatus: IncidentStatus.DISPATCHED },
            orderBy: { changedAt: 'asc' },
            take: 1,
            select: { changedAt: true },
          },
        },
      }),
    ]);

    // Calculate average response time
    const responseTimes: number[] = [];
    for (const incident of todayIncidents) {
      const dispatchEntry = incident.statusHistory[0];
      if (dispatchEntry) {
        const diffMs =
          new Date(dispatchEntry.changedAt).getTime() - new Date(incident.createdAt).getTime();
        responseTimes.push(diffMs / 60000);
      }
    }
    const avgResponseTimeMinutes =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : null;

    const byStatus = Object.fromEntries(
      byStatusRaw.map((r) => [r.status, r._count.status]),
    );
    const byType = Object.fromEntries(
      byTypeRaw.map((r) => [r.type, r._count.type]),
    );
    const byDistrict = byDistrictRaw.map((r) => ({
      district: r.district,
      count: r._count.district,
    }));

    return {
      totalToday,
      openCases,
      criticalOpen,
      resolvedToday,
      avgResponseTimeMinutes,
      byStatus,
      byType,
      byDistrict,
    };
  },

  async getOnDutyOfficers(agencyId: string) {
    const officers = await prisma.officer.findMany({
      where: { isOnDuty: true, agencyId },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        _count: { select: { assignments: { where: { status: 'ACTIVE' } } } },
      },
    });

    return officers.map((officer) => {
      const openCount = officer._count.assignments;
      let status: 'AVAILABLE' | 'BUSY' | 'OVERLOADED';
      if (openCount === 0) status = 'AVAILABLE';
      else if (openCount <= 2) status = 'BUSY';
      else status = 'OVERLOADED';

      return { ...officer, status };
    });
  },

  async forwardToAgency(
    incidentId: string,
    targetAgency: AgencyType,
    forwardedById: string,
    fromAgency: AgencyType,
    note?: string,
  ) {
    // Get the forwarder's info
    const forwarder = await prisma.user.findUnique({
      where: { id: forwardedById },
      select: { id: true, name: true },
    });

    // Get the target agency record
    const agency = await prisma.agency.findFirst({
      where: { type: targetAgency },
    });
    if (!agency) throw Object.assign(new Error('Target agency not found'), { statusCode: 404 });

    const [forwardLog, assignment] = await prisma.$transaction([
      prisma.forwardLog.create({
        data: {
          incidentId,
          fromAgency,
          toAgency: targetAgency,
          forwardedById,
          note,
        },
      }),
      prisma.assignment.create({
        data: {
          incidentId,
          agencyId: agency.id,
          notes: note,
        },
        include: { agency: true },
      }),
    ]);

    // Add internal case note
    await prisma.caseNote.create({
      data: {
        incidentId,
        authorId: forwardedById,
        note: `Forwarded to ${targetAgency} by ${forwarder?.name ?? forwardedById}${note ? `: ${note}` : ''}`,
        isInternal: true,
      },
    });

    return { forwardLog, assignment };
  },

  async getOfficerOpenCases(officerId: string) {
    return prisma.assignment.findMany({
      where: { officerId, status: 'ACTIVE' },
      include: {
        incident: {
          select: {
            id: true,
            trackingCode: true,
            type: true,
            severity: true,
            status: true,
            description: true,
            district: true,
            latitude: true,
            longitude: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async createShiftHandover(officerId: string, summary: string) {
    const openAssignments = await prisma.assignment.findMany({
      where: { officerId, status: 'ACTIVE' },
      select: { incidentId: true },
    });

    const openCaseIds = openAssignments.map((a) => a.incidentId);

    return prisma.shiftHandover.create({
      data: {
        officerId,
        summary,
        openCaseIds,
      },
    });
  },
};
