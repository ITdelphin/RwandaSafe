import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../config/database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    fireReport: {
      upsert: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    fireUnit: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    hydrant: {
      findMany: jest.fn(),
    },
    incident: {
      update: jest.fn(),
    },
    officer: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock socket
jest.mock('../../socket/socket', () => ({
  socketEmit: {
    newIncident: jest.fn(),
    incidentUpdated: jest.fn(),
    newMessage: jest.fn(),
    ambulanceDispatched: jest.fn(),
    ambulanceUpdated: jest.fn(),
    capacityUpdated: jest.fn(),
    capacityCritical: jest.fn(),
    massCasualtyActivated: jest.fn(),
    telemedicineReady: jest.fn(),
    unitDispatched: jest.fn(),
    unitUpdated: jest.fn(),
    fireHazmatAlert: jest.fn(),
    patternAlert: jest.fn(),
  },
}));

// Mock notifications
jest.mock('../notifications/notifications.service', () => ({
  notificationsService: {
    notifyReportReceived: jest.fn(),
    notifyStatusChange: jest.fn(),
    notifyNewMessage: jest.fn(),
  },
}));

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: { upload_stream: jest.fn(), destroy: jest.fn() },
  },
}));

function makeToken(role = 'FIRE_OFFICER', id = 'user-fire-1') {
  return jwt.sign({ id, phone: '+250788000033', role, isAnonymous: false }, env.JWT_SECRET);
}

const sampleOfficer = {
  id: 'officer-fire-1',
  userId: 'user-fire-1',
  agencyId: 'agency-fire-1',
  badgeNumber: 'FIRE-001',
  rank: 'Captain',
  isOnDuty: true,
  currentLat: -1.9441,
  currentLng: 30.0619,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  agency: {
    id: 'agency-fire-1',
    name: 'Kigali Fire Brigade',
    type: 'FIRE',
    region: 'Kigali',
    district: 'Nyarugenge',
    latitude: -1.9441,
    longitude: 30.0619,
    phone: '+250788444555',
    isActive: true,
  },
};

const sampleFireUnit = {
  id: 'unit-uuid-1',
  agencyId: 'agency-fire-1',
  callSign: 'FIRE-01',
  plateNumber: 'RAB001F',
  unitType: 'PUMPER',
  status: 'AVAILABLE',
  crewCount: 4,
  currentLat: -1.94,
  currentLng: 30.06,
  waterCapacityL: 5000,
  hasHazmatKit: false,
  isActive: true,
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

const sampleFireReport = {
  id: 'fr-uuid-1',
  incidentId: 'inc-uuid-1',
  fireType: 'STRUCTURAL_FIRE',
  hazmatLevel: null,
  chemicalInvolved: null,
  buildingType: 'Residential',
  buildingFloors: 3,
  estimatedOccupancy: 20,
  fireUnitId: null,
  additionalUnitsIds: [],
  dispatchedAt: null,
  arrivedAt: null,
  containedAt: null,
  resolvedAt: null,
  windSpeed: null,
  windDirection: null,
  weatherCondition: null,
  casualties: 0,
  postIncidentReport: null,
  reportSubmittedAt: null,
  reportSubmittedById: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

// TEST 1: POST /v1/fire/report — creates fire report
describe('POST /v1/fire/report', () => {
  it('creates a fire report for an incident', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.fireReport.upsert as jest.Mock).mockResolvedValue({
      ...sampleFireReport,
      incident: { id: 'inc-uuid-1', trackingCode: 'RW-001' },
      fireUnit: null,
    });

    const res = await request(app)
      .post('/v1/fire/report')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        incidentId: 'inc-uuid-1',
        fireType: 'STRUCTURAL_FIRE',
        buildingType: 'Residential',
        buildingFloors: 3,
        estimatedOccupancy: 20,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('fireType', 'STRUCTURAL_FIRE');
    expect(res.body.data).toHaveProperty('incidentId', 'inc-uuid-1');
  });
});

// TEST 2: POST /v1/fire/:incidentId/dispatch — dispatches fire units
describe('POST /v1/fire/:incidentId/dispatch', () => {
  it('dispatches available fire units to an incident', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.fireUnit.findMany as jest.Mock).mockResolvedValue([sampleFireUnit]);
    (prisma.fireUnit.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (prisma.fireReport.upsert as jest.Mock).mockResolvedValue({
      ...sampleFireReport,
      fireUnitId: 'unit-uuid-1',
      dispatchedAt: new Date().toISOString(),
      fireUnit: sampleFireUnit,
    });

    const res = await request(app)
      .post('/v1/fire/inc-uuid-1/dispatch')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ unitIds: ['unit-uuid-1'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('dispatchedUnits');
    expect(Array.isArray(res.body.data.dispatchedUnits)).toBe(true);
  });

  it('returns 400 when unit is not available', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.fireUnit.findMany as jest.Mock).mockResolvedValue([
      { ...sampleFireUnit, status: 'RESPONDING' },
    ]);

    const res = await request(app)
      .post('/v1/fire/inc-uuid-1/dispatch')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ unitIds: ['unit-uuid-1'] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not available/i);
  });
});

// TEST 3: PATCH /v1/fire/units/:id/status — update unit status
describe('PATCH /v1/fire/units/:id/status', () => {
  it('updates fire unit status with valid transition', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.fireUnit.findUnique as jest.Mock).mockResolvedValue(sampleFireUnit);
    (prisma.fireUnit.update as jest.Mock).mockResolvedValue({ ...sampleFireUnit, status: 'RESPONDING' });
    (prisma.fireReport.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    const res = await request(app)
      .patch('/v1/fire/units/unit-uuid-1/status')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ status: 'RESPONDING' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'RESPONDING');
  });

  it('returns 400 on invalid status transition', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.fireUnit.findUnique as jest.Mock).mockResolvedValue(sampleFireUnit); // AVAILABLE
    (prisma.fireUnit.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .patch('/v1/fire/units/unit-uuid-1/status')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ status: 'RETURNING' }); // invalid from AVAILABLE

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid transition/i);
  });
});

// TEST 4: GET /v1/fire/:incidentId/hydrants — nearest hydrants
describe('GET /v1/fire/:incidentId/hydrants', () => {
  it('returns nearest operational hydrants sorted by distance', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.hydrant.findMany as jest.Mock).mockResolvedValue([
      { id: 'hyd-1', latitude: -1.945, longitude: 30.062, isOperational: true, district: 'Nyarugenge', address: 'KN 5 Ave' },
      { id: 'hyd-2', latitude: -1.948, longitude: 30.065, isOperational: true, district: 'Nyarugenge', address: 'KG 11 Ave' },
    ]);

    const res = await request(app)
      .get('/v1/fire/inc-uuid-1/hydrants?lat=-1.9441&lng=30.0619')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('distanceMeters');
  });
});

// TEST 5: GET /v1/fire/chemicals — hazmat chemical lookup
describe('GET /v1/fire/chemicals', () => {
  it('returns matching chemicals for a query', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);

    const res = await request(app)
      .get('/v1/fire/chemicals?q=LPG')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('hazardClass');
    expect(res.body.data[0]).toHaveProperty('evacuationRadiusMeters');
  });
});

// TEST 6: GET /v1/fire/units — get fire units for agency
describe('GET /v1/fire/units', () => {
  it('returns all active fire units for the agency', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.fireUnit.findMany as jest.Mock).mockResolvedValue([sampleFireUnit]);

    const res = await request(app)
      .get('/v1/fire/units')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('callSign', 'FIRE-01');
    expect(res.body.data[0]).toHaveProperty('status', 'AVAILABLE');
  });
});
