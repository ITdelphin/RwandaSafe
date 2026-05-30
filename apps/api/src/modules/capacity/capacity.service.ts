import { prisma } from '../../config/database';
import { haversineDistance } from '../../utils/distanceCalc';

export const capacityService = {
  async getAllHospitalsCapacity(fromLat?: number, fromLng?: number) {
    const hospitals = await prisma.hospitalCapacity.findMany({
      include: { agency: true },
      orderBy: { agency: { name: 'asc' } },
    });

    return hospitals.map(h => ({
      ...h,
      distance:
        fromLat != null && fromLng != null && h.agency.latitude != null && h.agency.longitude != null
          ? Math.round(
              haversineDistance(fromLat, fromLng, h.agency.latitude, h.agency.longitude) * 10,
            ) / 10
          : null,
    }));
  },

  async getHospitalCapacity(agencyId: string) {
    const capacity = await prisma.hospitalCapacity.findUnique({
      where: { agencyId },
      include: { agency: true },
    });
    if (!capacity) throw Object.assign(new Error('Hospital capacity record not found'), { statusCode: 404 });
    return capacity;
  },

  async updateCapacity(
    agencyId: string,
    data: Partial<{
      emergencyBedsTotal: number;
      emergencyBedsAvail: number;
      icuBedsTotal: number;
      icuBedsAvail: number;
      bloodBankAPos: number;
      bloodBankANeg: number;
      bloodBankBPos: number;
      bloodBankBNeg: number;
      bloodBankOPos: number;
      bloodBankONeg: number;
      bloodBankABPos: number;
      bloodBankABNeg: number;
      surgeonOnCall: boolean;
      neurologistOnCall: boolean;
      cardiologistOnCall: boolean;
      pediatricianOnCall: boolean;
      isAcceptingPatients: boolean;
      statusMessage: string;
    }>,
    updatedById: string,
  ) {
    const updated = await prisma.hospitalCapacity.upsert({
      where: { agencyId },
      create: { agencyId, ...data },
      update: data,
      include: { agency: true },
    });
    return updated;
  },

  async releaseBed(agencyId: string, bedType: 'emergency' | 'icu') {
    const field =
      bedType === 'icu'
        ? { icuBedsAvail: { increment: 1 } }
        : { emergencyBedsAvail: { increment: 1 } };

    const updated = await prisma.hospitalCapacity.update({
      where: { agencyId },
      data: field,
      include: { agency: true },
    });
    return updated;
  },
};
