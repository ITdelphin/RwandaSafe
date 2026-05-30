import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../config/database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    investigation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    suspect: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    investigationEvidence: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    caseNote: {
      create: jest.fn(),
    },
    incident: {
      findMany: jest.fn(),
    },
    patternAlert: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
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

function makeToken(role = 'RIB_INVESTIGATOR', id = 'user-rib-1') {
  return jwt.sign({ id, phone: '+250788000044', role, isAnonymous: false }, env.JWT_SECRET);
}

const sampleOfficer = {
  id: 'officer-rib-1',
  userId: 'user-rib-1',
  agencyId: 'agency-rib-1',
  badgeNumber: 'RIB-001',
  rank: 'Investigator',
  isOnDuty: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  agency: {
    id: 'agency-rib-1',
    name: 'RIB Kigali',
    type: 'RIB',
    region: 'Kigali',
    district: 'Gasabo',
    latitude: -1.9355,
    longitude: 30.0928,
    phone: '+250788222333',
    isActive: true,
  },
};

const sampleInvestigation = {
  id: 'inv-uuid-1',
  caseNumber: 'RIB-2026-00001',
  title: 'Armed Robbery Investigation',
  description: 'Investigation into armed robbery at Kimironko market',
  status: 'OPEN',
  incidentId: 'inc-uuid-1',
  leadInvestigatorId: 'officer-rib-1',
  agencyId: 'agency-rib-1',
  classificationLevel: 'STANDARD',
  isSensitive: false,
  openedAt: new Date().toISOString(),
  closedAt: null,
  closureNote: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sampleSuspect = {
  id: 'susp-uuid-1',
  investigationId: 'inv-uuid-1',
  alias: 'John Doe',
  description: 'Male, medium height, scar on left cheek',
  age: 30,
  gender: 'MALE',
  nationality: 'Rwandan',
  knownAddresses: ['Kimironko, Kigali'],
  status: 'PERSON_OF_INTEREST',
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sampleEvidence = {
  id: 'ev-uuid-1',
  investigationId: 'inv-uuid-1',
  suspectId: null,
  type: 'PHOTO',
  title: 'CCTV Screenshot',
  description: 'Screenshot from Kimironko market CCTV',
  fileUrl: 'https://supabase.rwanda-safe.rw/storage/v1/object/public/evidence/cctv-1.jpg',
  filePublicId: 'cctv-1',
  collectedAt: new Date().toISOString(),
  collectedById: 'user-rib-1',
  chainOfCustody: [{ action: 'UPLOADED', byUserId: 'user-rib-1', at: new Date().toISOString() }],
  isAdmissible: true,
  createdAt: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

// TEST 1: POST /v1/investigations — creates investigation
describe('POST /v1/investigations', () => {
  it('creates a new investigation with case number', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.investigation.count as jest.Mock).mockResolvedValue(0);
    (prisma.investigation.create as jest.Mock).mockResolvedValue({
      ...sampleInvestigation,
      incident: null,
      leadInvestigator: null,
      agency: sampleOfficer.agency,
    });

    const res = await request(app)
      .post('/v1/investigations')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        title: 'Armed Robbery Investigation',
        description: 'Investigation into armed robbery at Kimironko market',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('caseNumber');
    expect(res.body.data.caseNumber).toMatch(/^RIB-\d{4}-\d{5}$/);
  });

  it('returns 400 when title is missing', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);

    const res = await request(app)
      .post('/v1/investigations')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ description: 'Some description' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/title/i);
  });
});

// TEST 2: GET /v1/investigations — list investigations
describe('GET /v1/investigations', () => {
  it('returns paginated investigations for the agency', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      [{ ...sampleInvestigation, leadInvestigator: null, _count: { suspects: 1, evidence: 2, tips: 0 } }],
      1,
    ]);

    const res = await request(app)
      .get('/v1/investigations')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total', 1);
  });
});

// TEST 3: GET /v1/investigations/:id — get single investigation
describe('GET /v1/investigations/:id', () => {
  it('returns investigation details with suspects and evidence', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.investigation.findUnique as jest.Mock).mockResolvedValue({
      ...sampleInvestigation,
      incident: null,
      leadInvestigator: null,
      agency: sampleOfficer.agency,
      suspects: [sampleSuspect],
      evidence: [sampleEvidence],
      tips: [],
    });

    const res = await request(app)
      .get('/v1/investigations/inv-uuid-1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('caseNumber', 'RIB-2026-00001');
    expect(Array.isArray(res.body.data.suspects)).toBe(true);
    expect(Array.isArray(res.body.data.evidence)).toBe(true);
  });
});

// TEST 4: POST /v1/investigations/:id/suspects — add suspect
describe('POST /v1/investigations/:id/suspects', () => {
  it('adds a suspect to an investigation', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.investigation.findUnique as jest.Mock).mockResolvedValue(sampleInvestigation);
    (prisma.suspect.create as jest.Mock).mockResolvedValue(sampleSuspect);

    const res = await request(app)
      .post('/v1/investigations/inv-uuid-1/suspects')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        alias: 'John Doe',
        description: 'Male, medium height',
        age: 30,
        gender: 'MALE',
        nationality: 'Rwandan',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('alias', 'John Doe');
    expect(res.body.data).toHaveProperty('status', 'PERSON_OF_INTEREST');
  });
});

// TEST 5: POST /v1/investigations/:id/evidence — upload evidence
describe('POST /v1/investigations/:id/evidence', () => {
  it('uploads evidence with chain of custody', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.investigation.findUnique as jest.Mock).mockResolvedValue(sampleInvestigation);
    (prisma.investigationEvidence.create as jest.Mock).mockResolvedValue(sampleEvidence);

    const res = await request(app)
      .post('/v1/investigations/inv-uuid-1/evidence')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        type: 'PHOTO',
        title: 'CCTV Screenshot',
        description: 'Screenshot from Kimironko market CCTV',
        filePublicId: 'cctv-1',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('type', 'PHOTO');
    expect(res.body.data).toHaveProperty('title', 'CCTV Screenshot');
  });

  it('returns 400 when evidence type is missing', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);

    const res = await request(app)
      .post('/v1/investigations/inv-uuid-1/evidence')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ title: 'Some evidence' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/type/i);
  });
});

// TEST 6: PATCH /v1/investigations/suspects/:id/status — update suspect status
describe('PATCH /v1/investigations/suspects/:id/status', () => {
  it('updates suspect status from PERSON_OF_INTEREST to SUSPECT', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.suspect.findUnique as jest.Mock).mockResolvedValue(sampleSuspect);
    (prisma.suspect.update as jest.Mock).mockResolvedValue({ ...sampleSuspect, status: 'SUSPECT' });

    const res = await request(app)
      .patch('/v1/investigations/suspects/susp-uuid-1/status')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ status: 'SUSPECT', notes: 'New evidence links suspect' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'SUSPECT');
  });
});

// TEST 7: POST /v1/investigations/:id/close — close investigation
describe('POST /v1/investigations/:id/close', () => {
  it('closes an investigation with a note', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.investigation.findUnique as jest.Mock).mockResolvedValue(sampleInvestigation);
    (prisma.investigation.update as jest.Mock).mockResolvedValue({
      ...sampleInvestigation,
      status: 'CLOSED_SOLVED',
      closedAt: new Date().toISOString(),
      closureNote: 'Suspect apprehended and charged',
    });

    const res = await request(app)
      .post('/v1/investigations/inv-uuid-1/close')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ status: 'CLOSED_SOLVED', note: 'Suspect apprehended and charged' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'CLOSED_SOLVED');
    expect(res.body.data).toHaveProperty('closureNote');
  });
});

// TEST 8: Auth guard
describe('Auth guard', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/v1/investigations');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
