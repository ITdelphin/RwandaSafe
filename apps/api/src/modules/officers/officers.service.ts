import { prisma } from '../../config/database';

export const officersService = {
  async getAgencyOfficers(agencyId: string, search?: string) {
    const where: any = { agencyId };

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { badgeNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.officer.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true, role: true } },
        _count: { select: { assignments: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getOfficerById(officerId: string) {
    const officer = await prisma.officer.findUnique({
      where: { id: officerId },
      include: {
        user: { select: { id: true, name: true, phone: true, role: true } },
        agency: true,
        assignments: {
          where: { status: 'ACTIVE' },
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
        },
      },
    });

    if (!officer) throw Object.assign(new Error('Officer not found'), { statusCode: 404 });
    return officer;
  },

  async toggleDuty(officerId: string) {
    const officer = await prisma.officer.findUnique({ where: { id: officerId } });
    if (!officer) throw Object.assign(new Error('Officer not found'), { statusCode: 404 });

    return prisma.officer.update({
      where: { id: officerId },
      data: { isOnDuty: !officer.isOnDuty },
      include: {
        user: { select: { id: true, name: true, phone: true, role: true } },
        agency: true,
      },
    });
  },

  async updateLocation(officerId: string, lat: number, lng: number) {
    const officer = await prisma.officer.findUnique({ where: { id: officerId } });
    if (!officer) throw Object.assign(new Error('Officer not found'), { statusCode: 404 });

    return prisma.officer.update({
      where: { id: officerId },
      data: { currentLat: lat, currentLng: lng },
      select: { id: true, currentLat: true, currentLng: true, updatedAt: true },
    });
  },
};
