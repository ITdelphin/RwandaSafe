import { prisma } from '../../config/database';
import { TriageLevel, BloodType, AmbulanceStatus, Prisma } from '@prisma/client';
import { haversineDistance } from '../../utils/distanceCalc';

const AMBULANCE_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE:    ['DISPATCHED'],
  DISPATCHED:   ['ON_SCENE', 'AVAILABLE'],
  ON_SCENE:     ['TRANSPORTING', 'AVAILABLE'],
  TRANSPORTING: ['AT_HOSPITAL'],
  AT_HOSPITAL:  ['AVAILABLE'],
  OFF_DUTY:     ['AVAILABLE'],
  MAINTENANCE:  ['AVAILABLE'],
};

export const medicalService = {
  async setTriageLevel(
    incidentId: string,
    triageLevel: TriageLevel,
    patientData: {
      symptoms?: string[];
      age?: number;
      gender?: string;
      bloodType?: BloodType;
      isConscious?: boolean;
      isBreathing?: boolean;
      vitalSigns?: Prisma.InputJsonValue;
    },
    officerId: string,
  ) {
    const medicalCase = await prisma.medicalCase.upsert({
      where: { incidentId },
      create: {
        incidentId,
        triageLevel,
        reportedSymptoms: patientData.symptoms ?? [],
        patientAge: patientData.age,
        patientGender: patientData.gender,
        patientBloodType: patientData.bloodType ?? 'UNKNOWN',
        isConscious: patientData.isConscious,
        isBreathing: patientData.isBreathing,
        vitalSigns: patientData.vitalSigns,
      },
      update: {
        triageLevel,
        reportedSymptoms: patientData.symptoms ?? [],
        patientAge: patientData.age,
        patientGender: patientData.gender,
        patientBloodType: patientData.bloodType ?? 'UNKNOWN',
        isConscious: patientData.isConscious,
        isBreathing: patientData.isBreathing,
        vitalSigns: patientData.vitalSigns,
      },
    });
    return medicalCase;
  },

  async dispatchAmbulance(incidentId: string, ambulanceId: string, dispatchedById: string) {
    const ambulance = await prisma.ambulance.findUnique({ where: { id: ambulanceId } });
    if (!ambulance) throw Object.assign(new Error('Ambulance not found'), { statusCode: 404 });
    if (ambulance.status !== 'AVAILABLE') throw Object.assign(new Error('Ambulance not available'), { statusCode: 400 });

    const [updatedAmb, medicalCase] = await prisma.$transaction([
      prisma.ambulance.update({
        where: { id: ambulanceId },
        data: { status: 'DISPATCHED', lastUpdated: new Date() },
      }),
      prisma.medicalCase.upsert({
        where: { incidentId },
        create: { incidentId, ambulanceId, dispatchedAt: new Date() },
        update: { ambulanceId, dispatchedAt: new Date() },
      }),
    ]);
    return { ambulance: updatedAmb, medicalCase };
  },

  async updateAmbulanceStatus(ambulanceId: string, status: AmbulanceStatus, lat?: number, lng?: number) {
    const ambulance = await prisma.ambulance.findUnique({ where: { id: ambulanceId } });
    if (!ambulance) throw Object.assign(new Error('Ambulance not found'), { statusCode: 404 });
    const valid = AMBULANCE_TRANSITIONS[ambulance.status] ?? [];
    if (!valid.includes(status)) {
      throw Object.assign(
        new Error(`Invalid transition: ${ambulance.status} → ${status}`),
        { statusCode: 400 },
      );
    }
    return prisma.ambulance.update({
      where: { id: ambulanceId },
      data: { status, currentLat: lat, currentLng: lng, lastUpdated: new Date() },
    });
  },

  async recommendHospital(
    incidentLat: number,
    incidentLng: number,
    triageLevel: TriageLevel,
    bloodType?: BloodType,
  ) {
    const hospitals = await prisma.hospitalCapacity.findMany({
      where: { isAcceptingPatients: true, emergencyBedsAvail: { gt: 0 } },
      include: { agency: true },
    });

    return hospitals
      .filter(h => triageLevel !== 'IMMEDIATE' || h.icuBedsAvail > 0)
      .map(h => ({
        id: h.id,
        agencyId: h.agencyId,
        name: h.agency.name,
        phone: h.agency.phone,
        emergencyBedsAvail: h.emergencyBedsAvail,
        icuBedsAvail: h.icuBedsAvail,
        hasRequiredBlood:
          !bloodType || bloodType === 'UNKNOWN'
            ? null
            : getBloodStock(h, bloodType) > 0,
        distance:
          h.agency.latitude != null && h.agency.longitude != null
            ? Math.round(
                haversineDistance(incidentLat, incidentLng, h.agency.latitude, h.agency.longitude) * 10,
              ) / 10
            : null,
      }))
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
      .slice(0, 3);
  },

  async assignReceivingHospital(incidentId: string, hospitalId: string, officerId: string) {
    const mc = await prisma.medicalCase.findUnique({ where: { incidentId } });

    const [updated] = await prisma.$transaction([
      prisma.medicalCase.upsert({
        where: { incidentId },
        create: { incidentId, receivingHospitalId: hospitalId },
        update: { receivingHospitalId: hospitalId },
      }),
      prisma.hospitalCapacity.update({
        where: { id: hospitalId },
        data: {
          emergencyBedsAvail: { decrement: 1 },
          ...(mc?.triageLevel === 'IMMEDIATE' ? { icuBedsAvail: { decrement: 1 } } : {}),
        },
      }),
    ]);
    return updated;
  },

  async activateMassCasualtyMode(
    data: {
      title: string;
      description?: string;
      location: string;
      lat: number;
      lng: number;
      estimatedCount: number;
    },
    createdById: string,
  ) {
    return prisma.massCasualtyEvent.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        latitude: data.lat,
        longitude: data.lng,
        estimatedCount: data.estimatedCount,
        createdById,
        isActive: true,
      },
    });
  },

  async createTelemedicineSession(incidentId: string, citizenUserId: string, doctorId?: string) {
    const sessionUrl = `https://meet.jit.si/rwanda-safe-${incidentId}`;
    return prisma.telemedicineSession.create({
      data: { incidentId, citizenUserId, doctorId, sessionUrl, status: 'PENDING' },
    });
  },

  async getBloodBankStatus() {
    const hospitals = await prisma.hospitalCapacity.findMany({ include: { agency: true } });
    const totals: Record<string, number> = {
      A_POSITIVE: 0,
      A_NEGATIVE: 0,
      B_POSITIVE: 0,
      B_NEGATIVE: 0,
      O_POSITIVE: 0,
      O_NEGATIVE: 0,
      AB_POSITIVE: 0,
      AB_NEGATIVE: 0,
    };
    for (const h of hospitals) {
      totals.A_POSITIVE  += h.bloodBankAPos;
      totals.A_NEGATIVE  += h.bloodBankANeg;
      totals.B_POSITIVE  += h.bloodBankBPos;
      totals.B_NEGATIVE  += h.bloodBankBNeg;
      totals.O_POSITIVE  += h.bloodBankOPos;
      totals.O_NEGATIVE  += h.bloodBankONeg;
      totals.AB_POSITIVE += h.bloodBankABPos;
      totals.AB_NEGATIVE += h.bloodBankABNeg;
    }
    return Object.entries(totals).map(([type, units]) => ({
      type,
      units,
      status: units < 2 ? 'CRITICAL' : units < 5 ? 'LOW' : 'OK',
    }));
  },

  async getAmbulances(agencyId: string) {
    return prisma.ambulance.findMany({
      where: { agencyId, isActive: true },
      orderBy: { callSign: 'asc' },
    });
  },

  async getAvailableAmbulances(agencyId: string) {
    return prisma.ambulance.findMany({
      where: { agencyId, status: 'AVAILABLE', isActive: true },
    });
  },

  async updateAmbulanceLocation(ambulanceId: string, lat: number, lng: number) {
    return prisma.ambulance.update({
      where: { id: ambulanceId },
      data: { currentLat: lat, currentLng: lng, lastUpdated: new Date() },
    });
  },
};

function getBloodStock(h: Record<string, unknown>, bloodType: string): number {
  const map: Record<string, string> = {
    A_POSITIVE:  'bloodBankAPos',
    A_NEGATIVE:  'bloodBankANeg',
    B_POSITIVE:  'bloodBankBPos',
    B_NEGATIVE:  'bloodBankBNeg',
    O_POSITIVE:  'bloodBankOPos',
    O_NEGATIVE:  'bloodBankONeg',
    AB_POSITIVE: 'bloodBankABPos',
    AB_NEGATIVE: 'bloodBankABNeg',
  };
  const field = map[bloodType];
  return field ? (h[field] as number) ?? 0 : 0;
}
