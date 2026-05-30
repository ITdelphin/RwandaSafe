import { prisma } from '../../config/database';
import { generateTrackingCode } from '../../utils/generateTrackingCode';
import { routeIncident } from '../../utils/incidentRouter';
import { notificationsService } from '../notifications/notifications.service';
import { CreateIncidentInput, UpdateStatusInput, AssignIncidentInput } from './incidents.schema';
import { IncidentStatus, Role } from '@prisma/client';
import { socketEmit } from '../../socket/socket';

// Valid forward transitions — no backwards moves
const STATUS_TRANSITIONS: Record<string, string[]> = {
  RECEIVED:     ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED:     ['DISPATCHED', 'CANCELLED'],
  DISPATCHED:   ['ON_SCENE'],
  ON_SCENE:     ['RESOLVED'],
  RESOLVED:     ['CLOSED'],
  CLOSED:       [],
  CANCELLED:    [],
};

const INCIDENT_INCLUDE = {
  reporter: { select: { id: true, name: true, phone: true } },
  media: true,
  assignments: { include: { officer: { include: { user: { select: { name: true } } } }, agency: true } },
  statusHistory: { orderBy: { changedAt: 'asc' as const } },
};

export const incidentsService = {
  async createIncident(data: CreateIncidentInput, reporterId: string | null) {
    const trackingCode = await generateTrackingCode();
    const targetAgencies = routeIncident(data.type);

    const incident = await prisma.incident.create({
      data: {
        trackingCode,
        type: data.type,
        severity: data.severity,
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        district: data.district,
        isAnonymous: data.isAnonymous,
        reporterId: data.isAnonymous ? null : reporterId,
        witnessName: data.witnessName,
        witnessPhone: data.witnessPhone,
        targetAgency: targetAgencies[0],
        statusHistory: {
          create: {
            newStatus: IncidentStatus.RECEIVED,
            changedById: reporterId ?? (await getSystemUserId()),
            note: 'Incident reported',
          },
        },
      },
      include: INCIDENT_INCLUDE,
    });

    // Emit to all relevant agency rooms
    for (const agency of targetAgencies) {
      try { socketEmit.newIncident(agency, incident); } catch { /* socket not ready */ }
    }

    // Notify citizen
    if (reporterId) {
      await notificationsService.notifyReportReceived(reporterId, trackingCode);
    }

    return incident;
  },

  async getIncidentById(id: string, requesterId: string, requesterRole: string) {
    const incident = await prisma.incident.findUnique({ where: { id }, include: INCIDENT_INCLUDE });
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });

    if (requesterRole === Role.CITIZEN && incident.reporterId !== requesterId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    return incident;
  },

  async getIncidentByTrackingCode(trackingCode: string) {
    const incident = await prisma.incident.findUnique({
      where: { trackingCode },
      select: {
        trackingCode: true,
        status: true,
        type: true,
        severity: true,
        district: true,
        createdAt: true,
        updatedAt: true,
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          select: { newStatus: true, note: true, changedAt: true },
        },
      },
    });
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    return incident;
  },

  async listIncidents(filters: any, requesterId: string, requesterRole: string) {
    const { page = 1, limit = 20, status, type, severity, district, from, to, search } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (requesterRole === Role.CITIZEN) {
      where.reporterId = requesterId;
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { trackingCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, incidents] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true } },
          media: { select: { id: true, url: true, type: true } },
          assignments: { include: { agency: true } },
        },
      }),
    ]);

    return {
      incidents,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  },

  async updateStatus(incidentId: string, data: UpdateStatusInput, updatedById: string) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });

    const allowed = STATUS_TRANSITIONS[incident.status] ?? [];
    if (!allowed.includes(data.status)) {
      throw Object.assign(
        new Error(`Cannot transition from ${incident.status} to ${data.status}`),
        { statusCode: 400 },
      );
    }

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: data.status as IncidentStatus,
        resolvedAt: data.status === 'RESOLVED' ? new Date() : undefined,
        isClosed: data.status === 'CLOSED' || data.status === 'CANCELLED',
        statusHistory: {
          create: {
            oldStatus: incident.status,
            newStatus: data.status as IncidentStatus,
            changedById: updatedById,
            note: data.note,
          },
        },
      },
      include: INCIDENT_INCLUDE,
    });

    try { socketEmit.incidentUpdated(incidentId, incident.reporterId ?? '', updated); } catch { /* ok */ }

    if (incident.reporterId) {
      await notificationsService.notifyStatusChange(incident.reporterId, incident.trackingCode, data.status);
    }

    return updated;
  },

  async assignIncident(incidentId: string, data: AssignIncidentInput, assignedById: string) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });

    const [assignment] = await prisma.$transaction([
      prisma.assignment.create({
        data: {
          incidentId,
          officerId: data.officerId,
          agencyId: data.agencyId,
          notes: data.notes,
        },
        include: { officer: { include: { user: true } }, agency: true },
      }),
      prisma.incident.update({
        where: { id: incidentId },
        data: {
          status: IncidentStatus.ASSIGNED,
          statusHistory: {
            create: {
              oldStatus: incident.status,
              newStatus: IncidentStatus.ASSIGNED,
              changedById: assignedById,
              note: data.notes,
            },
          },
        },
      }),
    ]);

    try { socketEmit.incidentUpdated(incidentId, incident.reporterId ?? '', assignment); } catch { /* ok */ }

    return assignment;
  },

  async addNote(incidentId: string, authorId: string, note: string, isInternal: boolean) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });

    const caseNote = await prisma.caseNote.create({
      data: { incidentId, authorId, note, isInternal },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    try { socketEmit.newMessage(incidentId, caseNote); } catch { /* ok */ }

    if (!isInternal && incident.reporterId && incident.reporterId !== authorId) {
      await notificationsService.notifyNewMessage(incident.reporterId, incident.trackingCode);
    }

    return caseNote;
  },

  async cancelIncident(incidentId: string, reporterId: string) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    if (incident.reporterId !== reporterId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    if (!['RECEIVED', 'UNDER_REVIEW'].includes(incident.status)) {
      throw Object.assign(new Error('Cannot cancel incident in current status'), { statusCode: 400 });
    }

    return prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: IncidentStatus.CANCELLED,
        isClosed: true,
        statusHistory: {
          create: {
            oldStatus: incident.status,
            newStatus: IncidentStatus.CANCELLED,
            changedById: reporterId,
            note: 'Cancelled by reporter',
          },
        },
      },
      include: INCIDENT_INCLUDE,
    });
  },

  async getStatusHistory(incidentId: string) {
    return prisma.statusHistory.findMany({
      where: { incidentId },
      orderBy: { changedAt: 'asc' },
      include: { changedBy: { select: { id: true, name: true, role: true } } },
    });
  },

  async getNotes(incidentId: string, requesterRole: string) {
    const where: any = { incidentId };
    if (requesterRole === Role.CITIZEN) {
      where.isInternal = false;
    }
    return prisma.caseNote.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
  },

  async submitFeedback(incidentId: string, userId: string, rating: number, comment?: string) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw Object.assign(new Error('Incident not found'), { statusCode: 404 });
    if (!['RESOLVED', 'CLOSED'].includes(incident.status)) {
      throw Object.assign(new Error('Can only submit feedback on resolved incidents'), { statusCode: 400 });
    }
    return prisma.feedback.create({ data: { incidentId, submittedById: userId, rating, comment } });
  },
};

async function getSystemUserId(): Promise<string> {
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (admin) return admin.id;
  // fallback: create a system user
  const sys = await prisma.user.upsert({
    where: { phone: '+250000000000' },
    update: {},
    create: { phone: '+250000000000', name: 'System', role: 'SUPER_ADMIN' },
  });
  return sys.id;
}
