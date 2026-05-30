import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../config/database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    incident: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    incidentMedia: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    caseNote: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    statusHistory: { findMany: jest.fn() },
    user: { findFirst: jest.fn(), upsert: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
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

// Mock socket
jest.mock('../../socket/socket', () => ({
  socketEmit: {
    newIncident: jest.fn(),
    incidentUpdated: jest.fn(),
    newMessage: jest.fn(),
  },
}));

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

function makeToken(role = 'CITIZEN', id = 'user-123') {
  return jwt.sign({ id, phone: '+250788000001', role, isAnonymous: false }, env.JWT_SECRET);
}

const sampleIncident = {
  id: 'inc-uuid-1',
  trackingCode: 'RW-2026-00001',
  type: 'ACCIDENT',
  severity: 'MEDIUM',
  status: 'RECEIVED',
  description: 'Car accident on road',
  latitude: -1.9441,
  longitude: 30.0619,
  isAnonymous: false,
  reporterId: 'user-123',
  isClosed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  media: [],
  assignments: [],
  statusHistory: [],
  reporter: { id: 'user-123', name: 'Test User', phone: '+250788000001' },
};

beforeEach(() => jest.clearAllMocks());

describe('POST /v1/incidents', () => {
  it('creates incident and returns tracking code', async () => {
    (prisma.incident.create as jest.Mock).mockResolvedValue(sampleIncident);
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user-123' });
    (prisma.incident.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app)
      .post('/v1/incidents')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        type: 'ACCIDENT',
        description: 'Car accident on the main road near market',
        latitude: -1.9441,
        longitude: 30.0619,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.trackingCode).toBe('RW-2026-00001');
  });

  it('allows anonymous report without auth header', async () => {
    (prisma.incident.create as jest.Mock).mockResolvedValue({ ...sampleIncident, isAnonymous: true, reporterId: null });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'sys-user' });
    (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'sys-user' });
    (prisma.incident.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app)
      .post('/v1/incidents')
      .send({
        type: 'CRIME',
        description: 'Witnessed a robbery at the shop near school',
        latitude: -1.9441,
        longitude: 30.0619,
        isAnonymous: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.isAnonymous).toBe(true);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/v1/incidents')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ type: 'ACCIDENT' }); // missing description, latitude, longitude

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid GPS coordinates', async () => {
    const res = await request(app)
      .post('/v1/incidents')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        type: 'ACCIDENT',
        description: 'Test incident description here',
        latitude: 999,
        longitude: 30.0619,
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /v1/incidents/track/:code', () => {
  it('returns public status without auth', async () => {
    (prisma.incident.findUnique as jest.Mock).mockResolvedValue({
      trackingCode: 'RW-2026-00001',
      status: 'RECEIVED',
      type: 'ACCIDENT',
      severity: 'MEDIUM',
      district: 'Kigali',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [],
    });

    const res = await request(app)
      .get('/v1/incidents/track/RW-2026-00001');

    expect(res.status).toBe(200);
    expect(res.body.data.trackingCode).toBe('RW-2026-00001');
    expect(res.body.data.reporterId).toBeUndefined();
  });
});

describe('PATCH /v1/incidents/:id/status', () => {
  it('returns 403 when citizen tries to update status', async () => {
    const res = await request(app)
      .patch('/v1/incidents/inc-uuid-1/status')
      .set('Authorization', `Bearer ${makeToken('CITIZEN')}`)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(403);
  });

  it('allows officer to update status', async () => {
    (prisma.incident.findUnique as jest.Mock).mockResolvedValue(sampleIncident);
    (prisma.incident.update as jest.Mock).mockResolvedValue({ ...sampleIncident, status: 'UNDER_REVIEW' });

    const res = await request(app)
      .patch('/v1/incidents/inc-uuid-1/status')
      .set('Authorization', `Bearer ${makeToken('POLICE_OFFICER')}`)
      .send({ status: 'UNDER_REVIEW' });

    expect(res.status).toBe(200);
  });
});

describe('POST /v1/incidents/:id/notes', () => {
  it('adds a note and returns it', async () => {
    const note = {
      id: 'note-1',
      incidentId: 'inc-uuid-1',
      authorId: 'user-123',
      note: 'Officer on the way',
      isInternal: false,
      createdAt: new Date().toISOString(),
      author: { id: 'user-123', name: 'Officer A', role: 'POLICE_OFFICER' },
    };

    (prisma.incident.findUnique as jest.Mock).mockResolvedValue(sampleIncident);
    (prisma.caseNote.create as jest.Mock).mockResolvedValue(note);

    const res = await request(app)
      .post('/v1/incidents/inc-uuid-1/notes')
      .set('Authorization', `Bearer ${makeToken('POLICE_OFFICER')}`)
      .send({ note: 'Officer on the way', isInternal: false });

    expect(res.status).toBe(201);
    expect(res.body.data.note).toBe('Officer on the way');
  });
});

describe('Media upload', () => {
  it('POST /v1/incidents/:id/media uploads file', async () => {
    const { v2: cloudinaryMock } = require('cloudinary');
    cloudinaryMock.uploader.upload_stream.mockImplementation((_opts: any, cb: any) => {
      const mockStream = {
        end: () => cb(null, { secure_url: 'https://cloudinary.com/test.jpg', public_id: 'test-public-id' }),
      };
      return mockStream;
    });

    (prisma.incidentMedia.count as jest.Mock).mockResolvedValue(0);
    (prisma.incidentMedia.create as jest.Mock).mockResolvedValue({
      id: 'media-1',
      incidentId: 'inc-uuid-1',
      url: 'https://cloudinary.com/test.jpg',
      type: 'PHOTO',
      createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/v1/incidents/inc-uuid-1/media')
      .set('Authorization', `Bearer ${makeToken()}`)
      .attach('file', Buffer.from('fake image data'), { filename: 'test.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toBe('https://cloudinary.com/test.jpg');
  });
});
