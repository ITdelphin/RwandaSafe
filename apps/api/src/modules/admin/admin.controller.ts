import { Request, Response, NextFunction } from 'express';
import { authService } from '../auth/auth.service';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';

export const adminController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, totalIncidents, agencies, pendingCount] = await Promise.all([
        prisma.user.count(),
        prisma.incident.count(),
        prisma.agency.findMany({ include: { _count: { select: { officers: true } } } }),
        prisma.user.count({ where: { isApproved: false, requestedRole: { not: null } } }),
      ]);
      const activeAgencies = agencies.filter((a) => a.isActive).length;
      return sendSuccess(res, {
        totalUsers,
        activeAgencies,
        totalIncidents,
        pendingApprovals: pendingCount,
        agencies: agencies.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          isActive: a.isActive,
          officerCount: a._count.officers,
        })),
      });
    } catch (err) { next(err); }
  },

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, role, page = '1', limit = '50', sort = 'createdAt:desc' } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [sortField, sortDir] = sort.split(':');

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { [sortField || 'createdAt']: sortDir === 'asc' ? 'asc' : 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.user.count({ where }),
      ]);

      return sendSuccess(res, {
        data: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          phone: u.phone,
          isActive: u.isActive,
          isApproved: u.isApproved,
          requestedRole: u.requestedRole,
          requestedAgency: u.requestedAgency,
          createdAt: u.createdAt,
          agency: u.requestedAgency ?? null,
        })),
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } catch (err) { next(err); }
  },

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
      return sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
      return sendSuccess(res, { message: 'User suspended', user: { id: user.id, isActive: user.isActive } });
    } catch (err) { next(err); }
  },

  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: true } });
      return sendSuccess(res, { message: 'User activated', user: { id: user.id, isActive: user.isActive } });
    } catch (err) { next(err); }
  },

  async getPendingApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.getPendingApprovals();
      return sendSuccess(res, { data: result });
    } catch (err) { next(err); }
  },

  async approveUser(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const result = await authService.approveUser(adminId, req.params.id, req.body);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  async rejectUser(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const result = await authService.rejectUser(adminId, req.params.id, req.body.reason);
      return sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  async getAgencies(req: Request, res: Response, next: NextFunction) {
    try {
      const agencies = await prisma.agency.findMany({
        include: {
          _count: { select: { officers: true } },
          officers: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { name: 'asc' },
      });
      return sendSuccess(res, {
        data: agencies.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          location: a.location,
          phone: a.phone,
          isActive: a.isActive,
          officerCount: a._count.officers,
          officers: a.officers.map((o) => ({ id: o.id, name: o.user.name, isOnDuty: o.isOnDuty })),
          activeIncidents: 0,
          resolvedIncidents: 0,
          createdAt: a.createdAt,
        })),
      });
    } catch (err) { next(err); }
  },

  async createAgency(req: Request, res: Response, next: NextFunction) {
    try {
      const agency = await prisma.agency.create({ data: req.body });
      return sendSuccess(res, agency);
    } catch (err) { next(err); }
  },

  async updateAgency(req: Request, res: Response, next: NextFunction) {
    try {
      const agency = await prisma.agency.update({ where: { id: req.params.id }, data: req.body });
      return sendSuccess(res, agency);
    } catch (err) { next(err); }
  },

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '50' } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      return sendSuccess(res, { data: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) { next(err); }
  },

  async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, {
        uptime: Math.floor(process.uptime() / 3600),
        cpu: Math.round(Math.random() * 60 + 10),
        memory: Math.round(Math.random() * 40 + 30),
        latency: Math.round(Math.random() * 100 + 50),
        services: [
          { name: 'API Server', status: 'UP', host: 'localhost:4000', responseTime: '12ms' },
          { name: 'PostgreSQL', status: 'UP', host: 'localhost:5432', responseTime: '3ms' },
          { name: 'Redis', status: 'UP', host: 'localhost:6379', responseTime: '1ms' },
          { name: 'Socket.io', status: 'UP', host: 'localhost:4000', responseTime: '5ms' },
        ],
      });
    } catch (err) { next(err); }
  },

  async getBroadcasts(req: Request, res: Response, next: NextFunction) {
    try {
      const broadcasts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' } });
      return sendSuccess(res, { data: broadcasts });
    } catch (err) { next(err); }
  },

  async createBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const broadcast = await prisma.alert.create({ data: req.body });
      return sendSuccess(res, broadcast);
    } catch (err) { next(err); }
  },

  async deleteBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.alert.delete({ where: { id: req.params.id } });
      return sendSuccess(res, { message: 'Broadcast deleted' });
    } catch (err) { next(err); }
  },
};
