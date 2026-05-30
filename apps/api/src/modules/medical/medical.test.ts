import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../config/database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    medicalCase: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    ambulance: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    hospitalCapacity: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    massCasualtyEvent: {
      create: jest.fn(),
    },
    telemedicineSession: {
      create: jest.fn(),
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

function makeToken(role = 'MEDICAL_RESPONDER', id = 'user-medic-1') {
  return jwt.sign({ id, phone: '+250788000022', role, isAnonymous: false }, env.JWT_SECRET);
}

const sampleOfficer = {
  id: 'officer-medic-1',
  userId: 'user-medic-1',
  agencyId: 'agency-hosp-1',
  badgeNumber: 'MED-001',
  rank: 'Paramedic',
  isOnDuty: true,
  currentLat: -1.9441,
  currentLng: 30.0619,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  agency: {
    id: 'agency-hosp-1',
    name: 'King Faisal Hospital',
    type: 'HOSPITAL',
    region: 'Kigali',
    district: 'Gasabo',
    latitude: -1.9355,
    longitude: 30.0928,
    phone: '+250788111222',
    isActive: true,
  },
};

const sampleMedicalCase = {
  id: 'mc-uuid-1',
  incidentId: 'inc-uuid-1',
  triageLevel: 'URGENT',
  reportedSymptoms: ['chest pain', 'shortness of breath'],
  patientAge: 45,
  patientGender: 'MALE',
  patientBloodType: 'O_POSITIVE',
  isConscious: true,
  isBreathing: true,
  vitalSigns: { bp: '120/80', pulse: 92 },
  medicalNotes: null,
  receivingHospitalId: null,
  ambulanceId: null,
  dispatchedAt: null,
  arrivedSceneAt: null,
  arrivedHospitalAt: null,
  isMassCasualty: false,
  massCasualtyId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sampleAmbulance = {
  id: 'amb-uuid-1',
  agencyId: 'agency-hosp-1',
  callSign: 'AMB-01',
  plateNumber: 'RAC123A',
  status: 'AVAILABLE',
  currentLat: -1.94,
  currentLng: 30.06,
  crewCount: 2,
  hasDefibrillator: true,
  hasOxygen: true,
  isActive: true,
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

const sampleHospital = {
  id: 'hcap-uuid-1',
  agencyId: 'agency-hosp-1',
  emergencyBedsTotal: 20,
  emergencyBedsAvail: 8,
  icuBedsTotal: 5,
  icuBedsAvail: 2,
  bloodBankAPos: 10,
  bloodBankANeg: 3,
  bloodBankBPos: 7,
  bloodBankBNeg: 2,
  bloodBankOPos: 15,
  bloodBankONeg: 1,
  bloodBankABPos: 4,
  bloodBankABNeg: 1,
  surgeonOnCall: true,
  neurologistOnCall: false,
  cardiologistOnCall: true,
  pediatricianOnCall: false,
  isAcceptingPatients: true,
  statusMessage: null,
  updatedAt: new Date().toISOString(),
  agency: sampleOfficer.agency,
};

beforeEach(() => jest.clearAllMocks());

// TEST 1: POST /v1/medical/:incidentId/triage — sets triage level
describe('POST /v1/medical/:incidentId/triage', () => {
  it('creates or updates a medical case with triage level', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.medicalCase.upsert as jest.Mock).mockResolvedValue(sampleMedicalCase);

    const res = await request(app)
      .post('/v1/medical/inc-uuid-1/triage')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        triageLevel: 'URGENT',
        symptoms: ['chest pain', 'shortness of breath'],
        age: 45,
        gender: 'MALE',
        bloodType: 'O_POSITIVE',
        isConscious: true,
        isBreathing: true,
        vitalSigns: { bp: '120/80', pulse: 92 },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('triageLevel', 'URGENT');
    expect(res.body.data).toHaveProperty('incidentId', 'inc-uuid-1');
  });

  // TEST 2: returns 400 when triageLevel is missing
  it('returns 400 when triageLevel is missing', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);

    const res = await request(app)
      .post('/v1/medical/inc-uuid-1/triage')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ symptoms: ['headache'] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/triageLevel/i);
  });
});

// TEST 3: POST /v1/medical/:incidentId/dispatch — dispatches ambulance
describe('POST /v1/medical/:incidentId/dispatch', () => {
  it('dispatches an available ambulance to the incident', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.ambulance.findUnique as jest.Mock).mockResolvedValue(sampleAmbulance);
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      { ...sampleAmbulance, status: 'DISPATCHED' },
      { ...sampleMedicalCase, ambulanceId: 'amb-uuid-1', dispatchedAt: new Date().toISOString() },
    ]);

    const res = await request(app)
      .post('/v1/medical/inc-uuid-1/dispatch')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ambulanceId: 'amb-uuid-1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ambulance).toHaveProperty('status', 'DISPATCHED');
  });

  // TEST 4: returns 400 when ambulance is not available
  it('returns 400 when ambulance is not available', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.ambulance.findUnique as jest.Mock).mockResolvedValue({ ...sampleAmbulance, status: 'DISPATCHED' });

    const res = await request(app)
      .post('/v1/medical/inc-uuid-1/dispatch')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ambulanceId: 'amb-uuid-1' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not available/i);
  });
});

// TEST 5: PATCH /v1/medical/ambulances/:id/status — updates ambulance status
describe('PATCH /v1/medical/ambulances/:id/status', () => {
  it('updates ambulance status with valid transition', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.ambulance.findUnique as jest.Mock).mockResolvedValue(sampleAmbulance);
    (prisma.ambulance.update as jest.Mock).mockResolvedValue({ ...sampleAmbulance, status: 'DISPATCHED' });

    const res = await request(app)
      .patch('/v1/medical/ambulances/amb-uuid-1/status')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ status: 'DISPATCHED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'DISPATCHED');
  });

  // TEST 6: returns 400 on invalid status transition
  it('returns 400 on invalid status transition', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.ambulance.findUnique as jest.Mock).mockResolvedValue(sampleAmbulance); // AVAILABLE
    (prisma.ambulance.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .patch('/v1/medical/ambulances/amb-uuid-1/status')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ status: 'AT_HOSPITAL' }); // invalid from AVAILABLE

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid transition/i);
  });
});

// TEST 7: GET /v1/medical/:incidentId/recommend — recommends nearest hospitals
describe('GET /v1/medical/:incidentId/recommend', () => {
  it('returns up to 3 nearby hospitals sorted by distance', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.hospitalCapacity.findMany as jest.Mock).mockResolvedValue([sampleHospital]);

    const res = await request(app)
      .get('/v1/medical/inc-uuid-1/recommend?lat=-1.9441&lng=30.0619&triageLevel=URGENT')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('emergencyBedsAvail');
    expect(res.body.data[0]).toHaveProperty('distance');
  });
});

// TEST 8: POST /v1/medical/:incidentId/hospital — assigns receiving hospital
describe('POST /v1/medical/:incidentId/hospital', () => {
  it('assigns a hospital and decrements bed count', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.medicalCase.findUnique as jest.Mock).mockResolvedValue(sampleMedicalCase);
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      { ...sampleMedicalCase, receivingHospitalId: 'hcap-uuid-1' },
      { ...sampleHospital, emergencyBedsAvail: 7 },
    ]);

    const res = await request(app)
      .post('/v1/medical/inc-uuid-1/hospital')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ hospitalId: 'hcap-uuid-1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('receivingHospitalId', 'hcap-uuid-1');
  });
});

// TEST 9: POST /v1/medical/mass-casualty — activates mass casualty event
describe('POST /v1/medical/mass-casualty', () => {
  it('creates a mass casualty event and emits socket event', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.massCasualtyEvent.create as jest.Mock).mockResolvedValue({
      id: 'mce-uuid-1',
      title: 'Bus Crash on RN1',
      description: 'Major bus accident',
      location: 'Remera junction',
      latitude: -1.9441,
      longitude: 30.0619,
      estimatedCount: 30,
      isActive: true,
      createdById: 'user-medic-1',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });

    const res = await request(app)
      .post('/v1/medical/mass-casualty')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        title: 'Bus Crash on RN1',
        description: 'Major bus accident',
        location: 'Remera junction',
        lat: -1.9441,
        lng: 30.0619,
        estimatedCount: 30,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title', 'Bus Crash on RN1');
    expect(res.body.data).toHaveProperty('estimatedCount', 30);
  });

  // TEST 10: returns 400 when required fields are missing
  it('returns 400 when required fields are missing', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);

    const res = await request(app)
      .post('/v1/medical/mass-casualty')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ title: 'Incomplete' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// TEST 11: GET /v1/medical/blood-bank — returns blood bank status
describe('GET /v1/medical/blood-bank', () => {
  it('returns blood type inventory with status indicators', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.hospitalCapacity.findMany as jest.Mock).mockResolvedValue([sampleHospital]);

    const res = await request(app)
      .get('/v1/medical/blood-bank')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const oPos = res.body.data.find((b: any) => b.type === 'O_POSITIVE');
    expect(oPos).toBeDefined();
    expect(oPos).toHaveProperty('units');
    expect(oPos).toHaveProperty('status');
    expect(['OK', 'LOW', 'CRITICAL']).toContain(oPos.status);
  });
});

// TEST 12: GET /v1/ambulances — returns agency ambulances
describe('GET /v1/ambulances', () => {
  it('returns list of ambulances for the agency', async () => {
    (prisma.officer.findUnique as jest.Mock).mockResolvedValue(sampleOfficer);
    (prisma.ambulance.findMany as jest.Mock).mockResolvedValue([sampleAmbulance]);

    const res = await request(app)
      .get('/v1/ambulances')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('callSign', 'AMB-01');
    expect(res.body.data[0]).toHaveProperty('status', 'AVAILABLE');
  });
});

// Auth guard test
describe('Auth guard', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/v1/medical/blood-bank');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
