import { prisma } from '../../config/database';
import { FireIncidentType, FireUnitStatus, HazmatLevel } from '@prisma/client';
import { haversineDistance } from '../../utils/distanceCalc';
import hazmatGuide from '../../data/hazmat-guide.json';
import { env } from '../../config/env';
import axios from 'axios';

// Valid fire unit status transitions
const FIRE_UNIT_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE:   ['RESPONDING'],
  RESPONDING:  ['ON_SCENE', 'AVAILABLE'],
  ON_SCENE:    ['RETURNING', 'AVAILABLE'],
  RETURNING:   ['AVAILABLE'],
  OFF_DUTY:    ['AVAILABLE'],
  MAINTENANCE: ['AVAILABLE'],
};

export const fireService = {
  // Create or update a FireReport for an incident
  async createFireReport(
    incidentId: string,
    data: {
      fireType?: FireIncidentType;
      hazmatLevel?: HazmatLevel;
      chemicalInvolved?: string;
      buildingType?: string;
      buildingFloors?: number;
      estimatedOccupancy?: number;
      casualties?: number;
    },
    officerId: string,
  ) {
    const report = await prisma.fireReport.upsert({
      where: { incidentId },
      create: {
        incidentId,
        fireType: data.fireType ?? 'STRUCTURAL_FIRE',
        hazmatLevel: data.hazmatLevel,
        chemicalInvolved: data.chemicalInvolved,
        buildingType: data.buildingType,
        buildingFloors: data.buildingFloors,
        estimatedOccupancy: data.estimatedOccupancy,
        casualties: data.casualties ?? 0,
        additionalUnitsIds: [],
      },
      update: {
        fireType: data.fireType ?? 'STRUCTURAL_FIRE',
        hazmatLevel: data.hazmatLevel,
        chemicalInvolved: data.chemicalInvolved,
        buildingType: data.buildingType,
        buildingFloors: data.buildingFloors,
        estimatedOccupancy: data.estimatedOccupancy,
        casualties: data.casualties ?? 0,
      },
      include: { incident: true, fireUnit: true },
    });
    return report;
  },

  // Dispatch fire units to an incident
  async dispatchUnits(incidentId: string, unitIds: string[], dispatchedById: string) {
    if (!unitIds || unitIds.length === 0) {
      throw Object.assign(new Error('At least one unit ID is required'), { statusCode: 400 });
    }

    // Validate all units are AVAILABLE
    const units = await prisma.fireUnit.findMany({
      where: { id: { in: unitIds } },
    });

    if (units.length !== unitIds.length) {
      throw Object.assign(new Error('One or more units not found'), { statusCode: 404 });
    }

    const unavailable = units.filter(u => u.status !== 'AVAILABLE');
    if (unavailable.length > 0) {
      throw Object.assign(
        new Error(`Units not available: ${unavailable.map(u => u.callSign).join(', ')}`),
        { statusCode: 400 },
      );
    }

    const primaryUnitId = unitIds[0];
    const additionalUnitIds = unitIds.slice(1);
    const now = new Date();

    // Set all units to RESPONDING
    await prisma.fireUnit.updateMany({
      where: { id: { in: unitIds } },
      data: { status: 'RESPONDING', lastUpdated: now },
    });

    // Upsert FireReport with dispatch data
    const report = await prisma.fireReport.upsert({
      where: { incidentId },
      create: {
        incidentId,
        fireUnitId: primaryUnitId,
        additionalUnitsIds: additionalUnitIds,
        dispatchedAt: now,
      },
      update: {
        fireUnitId: primaryUnitId,
        additionalUnitsIds: additionalUnitIds,
        dispatchedAt: now,
      },
      include: { fireUnit: true },
    });

    return { report, dispatchedUnits: units };
  },

  // Update a fire unit's status with location
  async updateUnitStatus(unitId: string, status: FireUnitStatus, lat?: number, lng?: number) {
    const unit = await prisma.fireUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw Object.assign(new Error('Fire unit not found'), { statusCode: 404 });

    const valid = FIRE_UNIT_TRANSITIONS[unit.status] ?? [];
    if (!valid.includes(status)) {
      throw Object.assign(
        new Error(`Invalid transition: ${unit.status} → ${status}`),
        { statusCode: 400 },
      );
    }

    const updatedUnit = await prisma.fireUnit.update({
      where: { id: unitId },
      data: {
        status,
        currentLat: lat ?? unit.currentLat,
        currentLng: lng ?? unit.currentLng,
        lastUpdated: new Date(),
      },
    });

    // Update FireReport timestamps based on transition
    if (status === 'ON_SCENE') {
      await prisma.fireReport.updateMany({
        where: { fireUnitId: unitId, arrivedAt: null },
        data: { arrivedAt: new Date() },
      });
    } else if (status === 'RETURNING') {
      await prisma.fireReport.updateMany({
        where: { fireUnitId: unitId, containedAt: null },
        data: { containedAt: new Date() },
      });
    }

    return updatedUnit;
  },

  // Get nearest operational hydrants sorted by Haversine distance
  async getNearestHydrants(lat: number, lng: number, radiusMeters = 2000) {
    const hydrants = await prisma.hydrant.findMany({
      where: { isOperational: true },
    });

    const radiusKm = radiusMeters / 1000;

    return hydrants
      .map(h => ({
        ...h,
        distanceMeters: Math.round(haversineDistance(lat, lng, h.latitude, h.longitude) * 1000),
      }))
      .filter(h => h.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 10);
  },

  // Fetch weather data from OpenWeatherMap or return mock data
  async getWeatherData(lat: number, lng: number, incidentId: string) {
    let weather: {
      temp: number;
      windSpeed: number;
      windDirection: string;
      humidity: number;
      conditions: string;
    };

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (apiKey) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
        const response = await axios.get<any>(url, { timeout: 5000 });
        const d = response.data as any;

        const degToCompass = (deg: number): string => {
          const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
          return dirs[Math.round(deg / 45) % 8];
        };

        weather = {
          temp: Math.round(d.main?.temp ?? 24),
          windSpeed: Math.round((d.wind?.speed ?? 0) * 3.6), // m/s to km/h
          windDirection: degToCompass(d.wind?.deg ?? 0),
          humidity: d.main?.humidity ?? 65,
          conditions: d.weather?.[0]?.description ?? 'Unknown',
        };
      } catch {
        // Fall back to mock data if API call fails
        weather = { temp: 24, windSpeed: 12, windDirection: 'NE', humidity: 65, conditions: 'Partly Cloudy' };
      }
    } else {
      // No API key — return mock data gracefully
      weather = { temp: 24, windSpeed: 12, windDirection: 'NE', humidity: 65, conditions: 'Partly Cloudy' };
    }

    // Update FireReport with weather data
    await prisma.fireReport.updateMany({
      where: { incidentId },
      data: {
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        weatherCondition: weather.conditions,
      },
    });

    return weather;
  },

  // Search hazmat guide by chemical name (case-insensitive)
  lookupChemical(query: string) {
    if (!query) return [];
    const q = query.toLowerCase();
    return (hazmatGuide as any[]).filter(chemical =>
      chemical.names.some((name: string) => name.toLowerCase().includes(q)),
    );
  },

  // Submit post-incident report and close the incident
  async submitPostIncidentReport(incidentId: string, report: string, officerId: string) {
    const now = new Date();

    const [fireReport] = await prisma.$transaction([
      prisma.fireReport.update({
        where: { incidentId },
        data: {
          postIncidentReport: report,
          reportSubmittedAt: now,
          reportSubmittedById: officerId,
          resolvedAt: now,
        },
      }),
      prisma.incident.update({
        where: { id: incidentId },
        data: { status: 'CLOSED', isClosed: true, resolvedAt: now },
      }),
    ]);

    return fireReport;
  },

  // Get all active fire units for an agency
  async getFireUnits(agencyId: string) {
    return prisma.fireUnit.findMany({
      where: { agencyId, isActive: true },
      orderBy: { callSign: 'asc' },
    });
  },

  // Get only AVAILABLE fire units for an agency
  async getAvailableUnits(agencyId: string) {
    return prisma.fireUnit.findMany({
      where: { agencyId, status: 'AVAILABLE', isActive: true },
      orderBy: { callSign: 'asc' },
    });
  },

  // Get paginated fire reports for an agency
  async getFireReports(
    agencyId: string,
    filters: {
      page?: number;
      limit?: number;
      fireType?: FireIncidentType;
      hazmatLevel?: HazmatLevel;
    } = {},
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      incident: {
        assignments: { some: { agencyId } },
      },
    };

    if (filters.fireType) where.fireType = filters.fireType;
    if (filters.hazmatLevel) where.hazmatLevel = filters.hazmatLevel;

    const [reports, total] = await prisma.$transaction([
      prisma.fireReport.findMany({
        where,
        include: {
          incident: { select: { id: true, trackingCode: true, status: true, district: true, latitude: true, longitude: true, createdAt: true } },
          fireUnit: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.fireReport.count({ where }),
    ]);

    return { reports, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};
