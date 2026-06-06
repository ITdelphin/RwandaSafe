# Rwanda Safe — Full Developer Prompt: Chapter 1 (Introduction & Foundation)

> **Document Reference:** Rwanda Safe SSD v1.0, Chapter 1  
> **Purpose:** This prompt gives a developer everything needed to set up the complete project foundation — folder structure, environment configuration, database schema bootstrapping, and base API scaffolding — before any feature is built.

---

## Context

You are building **Rwanda Safe**, a digital emergency reporting platform for Rwanda. Citizens use a mobile app or web browser to report accidents, medical emergencies, crimes, fires, and other safety incidents. Each report is routed to the correct authority (Police, Hospital, Fire Brigade, or RIB) who receive it on their own dedicated dashboard. A Super Admin dashboard gives the government full oversight.

This Chapter 1 setup covers:
1. Project initialization (monorepo structure)
2. Backend API scaffold (Node.js + Express)
3. PostgreSQL database setup with full schema
4. Environment configuration
5. Authentication scaffold (JWT + OTP)
6. Base middleware and error handling
7. Health check endpoint
8. Docker setup for local development

---

## 1. Project Structure

Create a monorepo with the following structure. Use this EXACTLY:

```
rwanda-safe/
├── apps/
│   ├── api/                  # Node.js backend (Express)
│   ├── mobile/               # React Native (Expo) — scaffold only in Chapter 1
│   ├── web-citizen/          # Next.js citizen web portal — scaffold only
│   ├── dashboard-police/     # Next.js police dashboard — scaffold only
│   ├── dashboard-hospital/   # Next.js hospital dashboard — scaffold only
│   ├── dashboard-fire/       # Next.js fire dashboard — scaffold only
│   ├── dashboard-rib/        # Next.js RIB dashboard — scaffold only
│   └── dashboard-admin/      # Next.js super admin dashboard — scaffold only
├── packages/
│   ├── shared-types/         # TypeScript types shared across all apps
│   ├── shared-utils/         # Shared utility functions
│   └── ui-components/        # Shared React components (used by dashboards)
├── docker/
│   ├── docker-compose.yml
│   └── postgres/
│       └── init.sql          # Full DB schema
├── .env.example
├── .gitignore
├── package.json              # Root workspace config
└── README.md
```

Use **npm workspaces** or **Turborepo** for the monorepo. Turborepo is preferred.

---

## 2. Root Configuration

### `package.json` (root)
```json
{
  "name": "rwanda-safe",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "db:migrate": "cd apps/api && npm run db:migrate",
    "db:seed": "cd apps/api && npm run db:seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

### `.env.example`
```env
# Application
NODE_ENV=development
APP_NAME=Rwanda Safe
APP_VERSION=1.0.0

# API Server
API_PORT=4000
API_BASE_URL=http://localhost:4000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rwanda_safe
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_change_in_production
JWT_REFRESH_EXPIRES_IN=30d

# Africa's Talking (SMS/OTP)
AT_API_KEY=your_africas_talking_api_key
AT_USERNAME=your_username
AT_SENDER_ID=RwandaSafe

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URLs (for CORS)
WEB_CITIZEN_URL=http://localhost:3000
DASHBOARD_POLICE_URL=http://localhost:3001
DASHBOARD_HOSPITAL_URL=http://localhost:3002
DASHBOARD_FIRE_URL=http://localhost:3003
DASHBOARD_RIB_URL=http://localhost:3004
DASHBOARD_ADMIN_URL=http://localhost:3005

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OTP
OTP_EXPIRES_MINUTES=5
OTP_MAX_ATTEMPTS=5

# File Upload
MAX_FILE_SIZE_MB=20
MAX_FILES_PER_INCIDENT=5
```

---

## 3. Backend API — Full Setup (`apps/api/`)

### Technology
- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma (for PostgreSQL)
- **Validation:** Zod
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.io (scaffold the setup, full events in Chapter 11)
- **Logging:** Winston
- **Testing:** Jest

### `apps/api/package.json`
```json
{
  "name": "@rwanda-safe/api",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx src/database/seed.ts",
    "db:studio": "prisma studio",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.19.0",
    "socket.io": "^4.7.0",
    "prisma": "^5.14.0",
    "@prisma/client": "^5.14.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "zod": "^3.23.0",
    "winston": "^3.13.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.3.0",
    "multer": "^1.4.5",
    "cloudinary": "^2.3.0",
    "africastalking": "^0.5.1",
    "firebase-admin": "^12.1.0",
    "redis": "^4.6.0",
    "dotenv": "^16.4.0",
    "uuid": "^10.0.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "tsx": "^4.11.0",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^10.0.0",
    "@types/node": "^20.14.0",
    "typescript": "^5.4.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.1.4"
  }
}
```

### Folder structure for `apps/api/src/`
```
src/
├── index.ts                  # Entry point
├── app.ts                    # Express app factory
├── config/
│   ├── env.ts                # Validated env config (using Zod)
│   ├── database.ts           # Prisma client singleton
│   ├── redis.ts              # Redis client
│   ├── firebase.ts           # Firebase Admin init
│   └── cloudinary.ts         # Cloudinary config
├── middleware/
│   ├── auth.ts               # JWT verification middleware
│   ├── rbac.ts               # Role-based access control
│   ├── errorHandler.ts       # Global error handler
│   ├── notFound.ts           # 404 handler
│   ├── rateLimiter.ts        # Rate limiting
│   ├── validate.ts           # Zod request validation
│   └── logger.ts             # Winston request logger
├── modules/
│   ├── auth/
│   │   ├── auth.router.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.schema.ts    # Zod schemas
│   ├── incidents/            # (scaffold only in Chapter 1)
│   ├── users/                # (scaffold only in Chapter 1)
│   ├── agencies/             # (scaffold only in Chapter 1)
│   ├── officers/             # (scaffold only in Chapter 1)
│   ├── resources/            # (scaffold only in Chapter 1)
│   ├── alerts/               # (scaffold only in Chapter 1)
│   ├── analytics/            # (scaffold only in Chapter 1)
│   └── notifications/        # (scaffold only in Chapter 1)
├── socket/
│   └── socket.ts             # Socket.io setup (scaffold)
├── utils/
│   ├── response.ts           # Standardized API response helpers
│   ├── generateTrackingCode.ts
│   ├── otp.ts                # OTP generation + SMS sending
│   └── pagination.ts
├── types/
│   └── index.ts              # Shared TypeScript types
└── database/
    └── seed.ts               # DB seed file
```

---

## 4. Database Schema — Full Prisma Schema

Create `apps/api/prisma/schema.prisma` with this EXACT schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────────────────────────

enum Role {
  CITIZEN
  POLICE_OFFICER
  MEDICAL_RESPONDER
  FIRE_OFFICER
  RIB_INVESTIGATOR
  SUPER_ADMIN
}

enum IncidentType {
  ACCIDENT
  MEDICAL_EMERGENCY
  CRIME
  FIRE
  GBV
  CORRUPTION
  MISSING_PERSON
  NATURAL_DISASTER
  OTHER
}

enum IncidentSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IncidentStatus {
  RECEIVED
  UNDER_REVIEW
  ASSIGNED
  DISPATCHED
  ON_SCENE
  RESOLVED
  CLOSED
  CANCELLED
}

enum AgencyType {
  POLICE
  HOSPITAL
  FIRE
  RIB
  GOVERNMENT
}

enum ResourceType {
  POLICE_VEHICLE
  AMBULANCE
  FIRE_TRUCK
  RESCUE_UNIT
  INVESTIGATION_VEHICLE
}

enum ResourceStatus {
  AVAILABLE
  DISPATCHED
  ON_SCENE
  TRANSPORTING
  AT_HOSPITAL
  MAINTENANCE
  OFF_DUTY
}

enum MediaType {
  PHOTO
  VIDEO
  AUDIO
  DOCUMENT
}

enum AlertSeverity {
  INFO
  WARNING
  DANGER
  CRITICAL
}

// ─── MODELS ──────────────────────────────────────────────────────────────────

model User {
  id              String    @id @default(uuid())
  phone           String    @unique
  name            String?
  nidaId          String?   @unique @map("nida_id")
  role            Role      @default(CITIZEN)
  isVerified      Boolean   @default(false) @map("is_verified")
  isAnonymous     Boolean   @default(false) @map("is_anonymous")
  isActive        Boolean   @default(true) @map("is_active")
  passwordHash    String?   @map("password_hash")
  fcmToken        String?   @map("fcm_token")
  preferredLang   String    @default("en") @map("preferred_lang")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  lastLoginAt     DateTime? @map("last_login_at")

  // Relations
  incidents       Incident[]          @relation("ReporterIncidents")
  assignedCases   Assignment[]        @relation("OfficerAssignments")
  caseNotes       CaseNote[]
  statusHistory   StatusHistory[]
  otpCodes        OtpCode[]
  refreshTokens   RefreshToken[]
  officer         Officer?
  feedback        Feedback[]

  @@map("users")
}

model OtpCode {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  code        String
  expiresAt   DateTime  @map("expires_at")
  isUsed      Boolean   @default(false) @map("is_used")
  attempts    Int       @default(0)
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("otp_codes")
}

model RefreshToken {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  token       String    @unique
  expiresAt   DateTime  @map("expires_at")
  isRevoked   Boolean   @default(false) @map("is_revoked")
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

model Agency {
  id          String      @id @default(uuid())
  name        String
  type        AgencyType
  region      String?
  district    String?
  latitude    Float?
  longitude   Float?
  phone       String?
  email       String?
  isActive    Boolean     @default(true) @map("is_active")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  officers    Officer[]
  resources   Resource[]
  assignments Assignment[]

  @@map("agencies")
}

model Officer {
  id            String    @id @default(uuid())
  userId        String    @unique @map("user_id")
  agencyId      String    @map("agency_id")
  badgeNumber   String?   @unique @map("badge_number")
  rank          String?
  isOnDuty      Boolean   @default(false) @map("is_on_duty")
  currentLat    Float?    @map("current_lat")
  currentLng    Float?    @map("current_lng")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  agency        Agency    @relation(fields: [agencyId], references: [id])
  assignments   Assignment[]

  @@map("officers")
}

model Incident {
  id              String            @id @default(uuid())
  trackingCode    String            @unique @map("tracking_code")
  type            IncidentType
  category        String?
  severity        IncidentSeverity  @default(MEDIUM)
  status          IncidentStatus    @default(RECEIVED)
  title           String?
  description     String
  latitude        Float
  longitude       Float
  address         String?
  district        String?
  isAnonymous     Boolean           @default(false) @map("is_anonymous")
  reporterId      String?           @map("reporter_id")
  witnessName     String?           @map("witness_name")
  witnessPhone    String?           @map("witness_phone")
  targetAgency    AgencyType?       @map("target_agency")
  isClosed        Boolean           @default(false) @map("is_closed")
  resolvedAt      DateTime?         @map("resolved_at")
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  reporter        User?             @relation("ReporterIncidents", fields: [reporterId], references: [id], onDelete: SetNull)
  media           IncidentMedia[]
  assignments     Assignment[]
  notes           CaseNote[]
  statusHistory   StatusHistory[]
  feedback        Feedback[]

  @@map("incidents")
}

model IncidentMedia {
  id            String      @id @default(uuid())
  incidentId    String      @map("incident_id")
  url           String
  publicId      String?     @map("public_id")
  type          MediaType
  filename      String?
  sizeBytes     Int?        @map("size_bytes")
  uploadedById  String?     @map("uploaded_by_id")
  createdAt     DateTime    @default(now()) @map("created_at")

  incident      Incident    @relation(fields: [incidentId], references: [id], onDelete: Cascade)

  @@map("incident_media")
}

model Assignment {
  id            String    @id @default(uuid())
  incidentId    String    @map("incident_id")
  officerId     String?   @map("officer_id")
  agencyId      String    @map("agency_id")
  assignedAt    DateTime  @default(now()) @map("assigned_at")
  status        String    @default("ACTIVE")
  notes         String?
  respondedAt   DateTime? @map("responded_at")
  closedAt      DateTime? @map("closed_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  incident      Incident  @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  officer       Officer?  @relation(fields: [officerId], references: [id], onDelete: SetNull)
  agency        Agency    @relation(fields: [agencyId], references: [id])

  @@map("assignments")
}

model CaseNote {
  id            String    @id @default(uuid())
  incidentId    String    @map("incident_id")
  authorId      String    @map("author_id")
  note          String
  isInternal    Boolean   @default(false) @map("is_internal")
  createdAt     DateTime  @default(now()) @map("created_at")

  incident      Incident  @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  author        User      @relation(fields: [authorId], references: [id])

  @@map("case_notes")
}

model StatusHistory {
  id            String          @id @default(uuid())
  incidentId    String          @map("incident_id")
  oldStatus     IncidentStatus? @map("old_status")
  newStatus     IncidentStatus  @map("new_status")
  changedById   String          @map("changed_by_id")
  note          String?
  changedAt     DateTime        @default(now()) @map("changed_at")

  incident      Incident        @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  changedBy     User            @relation(fields: [changedById], references: [id])

  @@map("status_history")
}

model Resource {
  id            String          @id @default(uuid())
  agencyId      String          @map("agency_id")
  type          ResourceType
  name          String
  plateNumber   String?         @unique @map("plate_number")
  status        ResourceStatus  @default(AVAILABLE)
  currentLat    Float?          @map("current_lat")
  currentLng    Float?          @map("current_lng")
  isActive      Boolean         @default(true) @map("is_active")
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  agency        Agency          @relation(fields: [agencyId], references: [id])

  @@map("resources")
}

model Alert {
  id            String        @id @default(uuid())
  title         String
  message       String
  district      String?
  severity      AlertSeverity @default(INFO)
  issuedById    String        @map("issued_by_id")
  isActive      Boolean       @default(true) @map("is_active")
  expiresAt     DateTime?     @map("expires_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  @@map("alerts")
}

model Feedback {
  id            String    @id @default(uuid())
  incidentId    String    @map("incident_id")
  submittedById String    @map("submitted_by_id")
  rating        Int
  comment       String?
  createdAt     DateTime  @default(now()) @map("created_at")

  incident      Incident  @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  submittedBy   User      @relation(fields: [submittedById], references: [id])

  @@map("feedback")
}
```

---

## 5. Core Source Files to Implement

### `apps/api/src/index.ts`
```typescript
import 'dotenv/config';
import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { initSocket } from './socket/socket';
import { logger } from './middleware/logger';
import { connectRedis } from './config/redis';

const server = http.createServer(app);
initSocket(server);

async function bootstrap() {
  await connectRedis();
  server.listen(env.API_PORT, () => {
    logger.info(`🚀 Rwanda Safe API running on port ${env.API_PORT}`);
    logger.info(`📋 Environment: ${env.NODE_ENV}`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
```

### `apps/api/src/app.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/logger';
import { globalRateLimiter } from './middleware/rateLimiter';
import { env } from './config/env';

// Routers (import as they are built)
import { authRouter } from './modules/auth/auth.router';

export const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    env.WEB_CITIZEN_URL,
    env.DASHBOARD_POLICE_URL,
    env.DASHBOARD_HOSPITAL_URL,
    env.DASHBOARD_FIRE_URL,
    env.DASHBOARD_RIB_URL,
    env.DASHBOARD_ADMIN_URL,
  ],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging & rate limiting
app.use(requestLogger);
app.use(globalRateLimiter);

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'Rwanda Safe API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    }
  });
});

// API routes
app.use('/v1/auth', authRouter);
// Additional routers will be added here in later chapters

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);
```

### `apps/api/src/config/env.ts`
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  AT_API_KEY: z.string().optional(),
  AT_USERNAME: z.string().optional(),
  AT_SENDER_ID: z.string().default('RwandaSafe'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  WEB_CITIZEN_URL: z.string().default('http://localhost:3000'),
  DASHBOARD_POLICE_URL: z.string().default('http://localhost:3001'),
  DASHBOARD_HOSPITAL_URL: z.string().default('http://localhost:3002'),
  DASHBOARD_FIRE_URL: z.string().default('http://localhost:3003'),
  DASHBOARD_RIB_URL: z.string().default('http://localhost:3004'),
  DASHBOARD_ADMIN_URL: z.string().default('http://localhost:3005'),
  OTP_EXPIRES_MINUTES: z.coerce.number().default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

### `apps/api/src/utils/response.ts`
```typescript
import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: ApiResponse<T>['meta']) {
  return res.status(statusCode).json({ success: true, data, meta });
}

export function sendError(res: Response, message: string, statusCode = 400, error?: string) {
  return res.status(statusCode).json({ success: false, error: error || message, message });
}

export function sendCreated<T>(res: Response, data: T) {
  return sendSuccess(res, data, 201);
}
```

### `apps/api/src/utils/generateTrackingCode.ts`
```typescript
import { prisma } from '../config/database';

/**
 * Generates a unique tracking code in the format: RW-YYYY-NNNNN
 * Example: RW-2026-00421
 */
export async function generateTrackingCode(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.incident.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      }
    }
  });
  const sequence = String(count + 1).padStart(5, '0');
  return `RW-${year}-${sequence}`;
}
```

### `apps/api/src/utils/otp.ts`
```typescript
import crypto from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function createOtp(userId: string): Promise<string> {
  // Invalidate any existing OTPs for this user
  await prisma.otpCode.updateMany({
    where: { userId, isUsed: false },
    data: { isUsed: true },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { userId, code, expiresAt },
  });

  return code;
}

export async function verifyOtp(userId: string, code: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) return false;

  if (otp.attempts >= env.OTP_MAX_ATTEMPTS) return false;

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { isUsed: true },
  });

  return true;
}

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${code}`);
    return;
  }

  if (!env.AT_API_KEY || !env.AT_USERNAME) {
    console.warn('Africa\'s Talking credentials not configured, skipping SMS');
    return;
  }

  const AfricasTalking = require('africastalking');
  const at = AfricasTalking({ apiKey: env.AT_API_KEY, username: env.AT_USERNAME });
  const sms = at.SMS;

  await sms.send({
    to: [phone],
    message: `Your Rwanda Safe verification code is: ${code}. Valid for ${env.OTP_EXPIRES_MINUTES} minutes. Do not share this code.`,
    from: env.AT_SENDER_ID,
  });
}
```

### `apps/api/src/middleware/auth.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendError } from '../utils/response';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  phone: string;
  role: Role;
  isAnonymous: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 'No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403);
    }
    next();
  };
}
```

### `apps/api/src/middleware/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors,
    });
  }

  const statusCode = (err as any).statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal server error' : err.message,
  });
}
```

### `apps/api/src/modules/auth/auth.schema.ts`
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+2507[2389]\d{7}$/, 'Must be a valid Rwandan phone number (+2507XXXXXXXX)'),
    name: z.string().min(2).max(100).optional(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string(),
    code: z.string().length(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body'];
```

### `apps/api/src/modules/auth/auth.service.ts`
```typescript
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { createOtp, verifyOtp, sendOtpSms } from '../../utils/otp';
import { Role } from '@prisma/client';

export const authService = {
  async requestOtp(phone: string, name?: string) {
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: { phone, name, role: Role.CITIZEN },
      });
    }

    const code = await createOtp(user.id);
    await sendOtpSms(phone, code);

    return { userId: user.id, message: 'OTP sent successfully' };
  },

  async verifyOtpAndLogin(phone: string, code: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new Error('User not found');

    const isValid = await verifyOtp(user.id, code);
    if (!isValid) throw new Error('Invalid or expired OTP');

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, lastLoginAt: new Date() },
    });

    const accessToken = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, isAnonymous: user.isAnonymous },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, user: { id: user.id, phone: user.phone, name: user.name, role: user.role } };
  },

  async refreshAccessToken(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = jwt.sign(
      { id: stored.user.id, phone: stored.user.phone, role: stored.user.role, isAnonymous: stored.user.isAnonymous },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return { accessToken };
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  },
};
```

### `apps/api/src/modules/auth/auth.router.ts`
```typescript
import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, verifyOtpSchema, loginSchema, refreshTokenSchema } from './auth.schema';

export const authRouter = Router();

// POST /v1/auth/register  — send OTP to new/existing phone
authRouter.post('/register', validate(registerSchema), authController.register);

// POST /v1/auth/verify    — verify OTP and get tokens
authRouter.post('/verify', validate(verifyOtpSchema), authController.verifyOtp);

// POST /v1/auth/login     — alias for register (sends OTP to existing user)
authRouter.post('/login', validate(loginSchema), authController.login);

// POST /v1/auth/refresh   — get new access token using refresh token
authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// POST /v1/auth/logout    — revoke refresh token
authRouter.post('/logout', authController.logout);
```

---

## 6. Docker Setup

### `docker/docker-compose.yml`
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: rwanda_safe_db
    environment:
      POSTGRES_DB: rwanda_safe
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: rwanda_safe_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

---

## 7. Seed Data

Create `apps/api/src/database/seed.ts` that inserts:

1. **5 agencies:**
   - Rwanda National Police (RNP) — type: POLICE, district: Kigali
   - King Faisal Hospital SAMU — type: HOSPITAL, district: Kigali
   - Rwanda Fire Brigade — type: FIRE, district: Kigali
   - Rwanda Investigation Bureau (RIB) — type: RIB, district: Kigali
   - Ministry of Internal Security — type: GOVERNMENT, district: Kigali

2. **One officer user per agency** with their role, agency link, and badge number.

3. **One Super Admin user** (phone: +250788000001)

4. **3 sample resources** (1 police car, 1 ambulance, 1 fire truck)

---

## 8. Shared Types Package

Create `packages/shared-types/src/index.ts` with TypeScript interfaces mirroring the Prisma schema. These will be imported by the frontend apps:

- `User`, `Incident`, `Agency`, `Officer`, `Resource`, `Alert`, `Feedback`
- All enums: `Role`, `IncidentType`, `IncidentSeverity`, `IncidentStatus`, `AgencyType`, etc.
- API response types: `ApiResponse<T>`, `PaginatedResponse<T>`

---

## 9. Definition of Done for Chapter 1

The developer must confirm all of the following before moving to Chapter 2:

- [ ] Monorepo initializes with `npm install` at root without errors
- [ ] `docker-compose up` starts PostgreSQL and Redis cleanly
- [ ] `prisma migrate dev` runs without errors and creates all tables
- [ ] `prisma db seed` inserts the seed data without errors
- [ ] API server starts with `npm run dev` and logs "Rwanda Safe API running on port 4000"
- [ ] `GET /health` returns `{ success: true, data: { status: "healthy" } }`
- [ ] `POST /v1/auth/register` with a valid phone sends an OTP (logged to console in dev mode) and returns `{ success: true }`
- [ ] `POST /v1/auth/verify` with correct OTP returns `{ accessToken, refreshToken, user }`
- [ ] `POST /v1/auth/refresh` with valid refreshToken returns new accessToken
- [ ] `POST /v1/auth/logout` revokes the refresh token
- [ ] All other app folders (`dashboard-police`, `mobile`, etc.) are scaffolded as empty Next.js / Expo projects
- [ ] `.env.example` is complete and `.env` is in `.gitignore`
- [ ] No TypeScript errors (`tsc --noEmit` passes)

---

## Notes for Developer

- In **development mode**, OTPs are printed to the console instead of being sent via SMS. You do not need Africa's Talking credentials to test locally.
- All dashboard apps (`dashboard-police`, etc.) should be scaffolded with `create-next-app` but left with default content. Full implementation starts in Chapter 5.
- The mobile app should be scaffolded with `expo init` but left empty. Full implementation starts in Chapter 4.
- Use `prisma studio` to visually inspect the database during development.
- The `shared-types` package should be built before the API or any frontend app that imports from it.
- Refer to the Rwanda Safe SSD v1.0 document for the full system context and feature specifications.

---

*End of Chapter 1 Developer Prompt — Rwanda Safe v1.0*
