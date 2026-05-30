import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../middleware/logger';

export let io: SocketServer;

export function initSocket(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: [
        env.WEB_CITIZEN_URL,
        env.DASHBOARD_POLICE_URL,
        env.DASHBOARD_HOSPITAL_URL,
        env.DASHBOARD_FIRE_URL,
        env.DASHBOARD_RIB_URL,
        env.DASHBOARD_ADMIN_URL,
      ],
      credentials: true,
    },
  });

  // Auth middleware — allow anonymous connections (no token → limited access)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // anonymous
    try {
      const user = jwt.verify(token, env.JWT_SECRET) as any;
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);
    const user = socket.data.user;

    if (user) {
      // Citizen joins personal room to receive updates on their reports
      socket.join(`user:${user.id}`);

      // Officers join their agency room to receive new incident alerts
      if (user.role !== 'CITIZEN') {
        socket.join(`agency:${user.role}`);
      }
    }

    // Room for a specific incident (citizen-officer chat)
    socket.on('join:incident', (incidentId: string) => {
      socket.join(`incident:${incidentId}`);
    });

    socket.on('leave:incident', (incidentId: string) => {
      socket.leave(`incident:${incidentId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

export function getIo(): SocketServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export const socketEmit = {
  newIncident: (agencyType: string, incident: any) => {
    if (!io) return;
    io.to(`agency:${agencyType}`).emit('incident:new', incident);
  },

  incidentUpdated: (incidentId: string, userId: string, update: any) => {
    if (!io) return;
    io.to(`incident:${incidentId}`).emit('incident:updated', update);
    if (userId) io.to(`user:${userId}`).emit('incident:updated', update);
  },

  newMessage: (incidentId: string, message: any) => {
    if (!io) return;
    io.to(`incident:${incidentId}`).emit('message:new', message);
  },
};
