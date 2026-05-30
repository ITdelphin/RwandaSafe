import { prisma } from '../../config/database';
import { ResourceStatus } from '@prisma/client';

export const resourcesService = {
  async getAgencyResources(agencyId: string) {
    return prisma.resource.findMany({
      where: { agencyId, isActive: true },
      include: {
        agency: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateStatus(resourceId: string, status: ResourceStatus) {
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw Object.assign(new Error('Resource not found'), { statusCode: 404 });

    return prisma.resource.update({
      where: { id: resourceId },
      data: { status },
      include: { agency: { select: { id: true, name: true, type: true } } },
    });
  },

  async updateLocation(resourceId: string, lat: number, lng: number) {
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw Object.assign(new Error('Resource not found'), { statusCode: 404 });

    return prisma.resource.update({
      where: { id: resourceId },
      data: { currentLat: lat, currentLng: lng },
      select: { id: true, name: true, type: true, currentLat: true, currentLng: true, updatedAt: true },
    });
  },
};
