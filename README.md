# Rwanda Safe — Emergency Reporting Platform

A unified digital emergency reporting platform for Rwanda.

## Quick Start

### 1. Start infrastructure
```bash
cd docker
docker-compose up -d
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up API environment
```bash
cp .env.example apps/api/.env
# Edit apps/api/.env — DATABASE_URL is already set for local Docker
```

### 4. Run database migrations & seed
```bash
cd apps/api
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Start the API
```bash
npm run dev
# API runs at http://localhost:4000
```

### 6. Verify
```bash
curl http://localhost:4000/health
# {"success":true,"data":{"status":"healthy",...}}
```

## Project Structure

```
rwanda-safe/
├── apps/
│   ├── api/                 # Node.js + Express API (port 4000)
│   ├── mobile/              # React Native / Expo (Chapter 4)
│   ├── web-citizen/         # Next.js citizen portal (port 3000)
│   ├── dashboard-police/    # RNP dashboard (port 3001)
│   ├── dashboard-hospital/  # SAMU dashboard (port 3002)
│   ├── dashboard-fire/      # Fire dashboard (port 3003)
│   ├── dashboard-rib/       # RIB dashboard (port 3004)
│   └── dashboard-admin/     # Super Admin dashboard (port 3005)
├── packages/
│   ├── shared-types/        # TypeScript types shared across apps
│   ├── shared-utils/        # Shared utility functions
│   └── ui-components/       # Shared React components
└── docker/                  # PostgreSQL + Redis compose
```

## Auth API (Chapter 1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /v1/auth/register | Send OTP to phone (creates user if new) |
| POST | /v1/auth/verify | Verify OTP → get accessToken + refreshToken |
| POST | /v1/auth/login | Send OTP to existing user |
| POST | /v1/auth/refresh | Get new accessToken from refreshToken |
| POST | /v1/auth/logout | Revoke refresh token |

In development, OTPs are printed to the console (no SMS needed).

## Seed Accounts

| Role | Phone |
|------|-------|
| Super Admin | +250788000001 |
| Police Officer | +250788100001 |
| Medical Responder | +250788200001 |
| Fire Officer | +250788300001 |
| RIB Investigator | +250788400001 |

## Tech Stack

- **API**: Node.js 20, Express, TypeScript, Prisma, PostgreSQL, Redis, Socket.io
- **Mobile**: React Native + Expo
- **Dashboards**: Next.js 14 + Tailwind CSS
- **Auth**: JWT (24h) + OTP via Africa's Talking
- **Notifications**: Firebase Cloud Messaging
- **Storage**: Cloudinary / AWS S3
- **Maps**: Google Maps Platform
