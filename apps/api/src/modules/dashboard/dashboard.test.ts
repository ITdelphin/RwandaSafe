import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../config/database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    incident: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    officer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    agency: {
      findFirst: jest.fn(),
    },
    assignment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    forwardLog: {
      create: jest.fn(),
    },
    caseNote: {
      create: jest.fn(),
    },
    shiftHandover: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
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

function makeToken(role = 'POLICE_OFFICER', id = 'user-officer-1') {
  return jwt.sign({ id, phone: '+250788000011', role, isAnonymous: false }, env.JWT_SECRET);
}

const sampleOfficer = {
  id: 'officer-1',
  userId: 'user-officer-1',
  agencyId: 'agency-1',
  badgeNumber: 'RNP-001',
  rank: 'Sergeant',
  isOnDuty: true,
  currentLat: -1.9441,
  currentLng: 30.0619,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  agency: {
    id: 'agency-1',
    name: 'Rwanda National Police HQ',
    type: 'POLICE',
    region: 'Kigali',
    district: 'Nyarugenge',
    isActive: true,
  },
};

const sampleIncident = {
  id: 'inc-uuid-1',
  trackingCode: 'RW-2026-00001',
  type: 'ACCIDENT',
  severity: 'CRITICAL',
  status: 'RECEIVED',
  description: 'Serious road accident on RN1',
  latitude: -1.9441,
  longitude: 30.0619,
  district: 'Nyarugenge',
  isAnonymous: false,
  targetAgency: 'POLICE',
  isClosed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  reporter: { id: 'user-123', name: 'Test User', phone: '+250788000001' },
  assignments: [],
  notes: [],
  _count: { media: 0 },
};

beforeEach(() => jest.clearAllMocks());

// TEST 1: GET /v1/dashboard/incidents — returns paginated incidents for agency
describe('GET /v1/dashboard/incidents', () => {
  it('returns incident list for POLICE agency', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.incident.count as jest.Mock).mockResolvedValue(1);
    (prisma.incident.findMany as jest.Mock).mockResolvedValue([sampleIncident]);

    const res = await request(app)
      .get('/v1/dashboard/incidents')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
  });

  // TEST 2: returns 400 when no agency type can be determined (SUPER_ADMIN without query param)
  it('returns 400 when agencyType is missing (SUPER_ADMIN with no query)', async () => {
    const res = await request(app)
      .get('/v1/dashboard/incidents')
      .set('Authorization', `Bearer ${makeToken('SUPER_ADMIN', 'admin-1')}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Agency type required/i);
  });
});

// TEST 3: GET /v1/dashboard/incidents?agencyType=POLICE — SUPER_ADMIN can query any agency
describe('GET /v1/dashboard/incidents with explicit agencyType (SUPER_ADMIN)', () => {
  it('returns incidents when SUPER_ADMIN passes agencyType query param', async () => {
    (prisma.incident.count as jest.Mock).mockResolvedValue(2);
    (prisma.incident.findMany as jest.Mock).mockResolvedValue([sampleIncident, { ...sampleIncident, id: 'inc-uuid-2' }]);

    const res = await request(app)
      .get('/v1/dashboard/incidents?agencyType=POLICE&page=1&limit=10')
      .set('Authorization', `Bearer ${makeToken('SUPER_ADMIN', 'admin-1')}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(2);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(10);
    expect(res.body.data.totalPages).toBe(1);
  });
});

// TEST 4: GET /v1/dashboard/map — returns map data
describe('GET /v1/dashboard/map', () => {
  it('returns incident map data for agency', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.incident.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'inc-uuid-1',
        trackingCode: 'RW-2026-00001',
        type: 'ACCIDENT',
        severity: 'CRITICAL',
        status: 'RECEIVED',
        latitude: -1.9441,
        longitude: 30.0619,
        createdAt: new Date().toISOString(),
      },
    ]);

    const res = await request(app)
      .get('/v1/dashboard/map')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('latitude');
    expect(res.body.data[0]).toHaveProperty('longitude');
  });
});

// TEST 5: GET /v1/dashboard/stats — returns stats
describe('GET /v1/dashboard/stats', () => {
  it('returns agency statistics', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.incident.count as jest.Mock).mockResolvedValue(5);
    (prisma.incident.groupBy as jest.Mock).mockResolvedValue([]);
    (prisma.incident.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .get('/v1/dashboard/stats')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalToday');
    expect(res.body.data).toHaveProperty('openCases');
    expect(res.body.data).toHaveProperty('criticalOpen');
    expect(res.body.data).toHaveProperty('resolvedToday');
    expect(res.body.data).toHaveProperty('byStatus');
    expect(res.body.data).toHaveProperty('byType');
    expect(res.body.data).toHaveProperty('byDistrict');
  });
});

// TEST 6: GET /v1/dashboard/officers — returns on-duty officers
describe('GET /v1/dashboard/officers', () => {
  it('returns on-duty officers with status computed', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.officer.findMany as jest.Mock).mockResolvedValue([
      {
        ...sampleOfficer,
        user: { id: 'user-officer-1', name: 'Officer John', phone: '+250788000011' },
        _count: { assignments: 0 },
      },
    ]);

    const res = await request(app)
      .get('/v1/dashboard/officers')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('status', 'AVAILABLE');
  });
});

// TEST 7: POST /v1/dashboard/forward — forwards incident to another agency
describe('POST /v1/dashboard/forward', () => {
  it('forwards an incident to target agency', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-officer-1', name: 'Officer John' });
    (prisma.agency.findFirst as jest.Mock).mockResolvedValue({ id: 'agency-2', type: 'HOSPITAL', name: 'CHK' });
    // forwardLog.create and assignment.create are called inside the $transaction array
    (prisma.forwardLog.create as jest.Mock).mockResolvedValue(
      { id: 'fwdlog-1', incidentId: 'inc-uuid-1', fromAgency: 'POLICE', toAgency: 'HOSPITAL' },
    );
    (prisma.assignment.create as jest.Mock).mockResolvedValue(
      { id: 'assign-1', incidentId: 'inc-uuid-1', agencyId: 'agency-2', agency: { id: 'agency-2', type: 'HOSPITAL' } },
    );
    (prisma.$transaction as jest.Mock).mockImplementation(async (ops: any[]) => Promise.all(ops));
    (prisma.caseNote.create as jest.Mock).mockResolvedValue({ id: 'note-1' });

    const res = await request(app)
      .post('/v1/dashboard/forward')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ incidentId: 'inc-uuid-1', targetAgency: 'HOSPITAL', note: 'Patient needs medical attention' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // TEST 8: POST /v1/dashboard/forward — returns 400 when required fields missing
  it('returns 400 when incidentId or targetAgency is missing', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);

    const res = await request(app)
      .post('/v1/dashboard/forward')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ note: 'missing fields' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// TEST 9: POST /v1/dashboard/handover — creates shift handover
describe('POST /v1/dashboard/handover', () => {
  it('creates a shift handover record for the officer', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.assignment.findMany as jest.Mock).mockResolvedValue([
      { incidentId: 'inc-uuid-1' },
      { incidentId: 'inc-uuid-2' },
    ]);
    (prisma.shiftHandover.create as jest.Mock).mockResolvedValue({
      id: 'handover-1',
      officerId: 'officer-1',
      summary: 'Handing off 2 open cases to night shift',
      openCaseIds: ['inc-uuid-1', 'inc-uuid-2'],
      createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/v1/dashboard/handover')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ summary: 'Handing off 2 open cases to night shift' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', 'handover-1');
    expect(res.body.data.openCaseIds).toHaveLength(2);
  });

  it('returns 400 when summary is missing', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);

    const res = await request(app)
      .post('/v1/dashboard/handover')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// TEST 10: GET /v1/dashboard/handover/latest — returns most recent handover
describe('GET /v1/dashboard/handover/latest', () => {
  it('returns the latest handover for the officer', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.shiftHandover.findFirst as jest.Mock).mockResolvedValue({
      id: 'handover-1',
      officerId: 'officer-1',
      summary: 'Previous shift summary',
      openCaseIds: ['inc-uuid-1'],
      createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .get('/v1/dashboard/handover/latest')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', 'handover-1');
    expect(res.body.data).toHaveProperty('summary');
  });

  it('returns null when no handover exists yet', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.shiftHandover.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .get('/v1/dashboard/handover/latest')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });
});

// TEST: 401 without auth token
describe('Auth guard', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/v1/dashboard/incidents');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
