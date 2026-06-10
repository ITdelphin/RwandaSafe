# Rwanda Safe — Full Developer Prompt: Chapter 6 (Super Admin Dashboard)

> **Document Reference:** Rwanda Safe SSD v1.0, Chapter 9  
> **Depends on:** Chapters 1 ✅, 2 ✅, 3 ✅, 4 ✅, and 5 ✅ fully completed  
> **Purpose:** Build the Super Admin dashboard — the government-level control panel with full visibility across ALL agencies, national analytics, user management, system configuration, broadcast alerts, SLA management, and open data exports.

---

## What This Chapter Builds

1. Super Admin dashboard Next.js app — all screens
2. National incident map (all active incidents across all agencies)
3. Cross-agency statistics and performance scorecards
4. User & officer account management (create, suspend, delete)
5. Broadcast alert system (push notification to all users by district)
6. SLA configuration (set response time targets per severity)
7. National animated heat map (incident density over time)
8. Agency comparison panel
9. Audit log viewer (every action taken in the system)
10. Open data export (anonymized monthly CSV/JSON)
11. System health monitor (API status, DB status, queue status)
12. New backend API endpoints for admin-only operations
13. Full test coverage

---

## Part A — Backend: Admin API Endpoints

### A1. New Files to Create

```
apps/api/src/modules/
├── admin/
│   ├── admin.router.ts
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   └── admin.schema.ts
├── audit/
│   ├── audit.service.ts
│   └── audit.middleware.ts
├── sla/
│   ├── sla.router.ts
│   ├── sla.controller.ts
│   └── sla.service.ts
└── opendata/
    ├── opendata.router.ts
    └── opendata.service.ts
```

---

### A2. New Prisma Models

Add to `apps/api/prisma/schema.prisma`:

```prisma
model AuditLog {
  id            String    @id @default(uuid())
  actorId       String?   @map("actor_id")
  actorRole     String?   @map("actor_role")
  action        String
  resourceType  String    @map("resource_type")
  resourceId    String?   @map("resource_id")
  oldValue      Json?     @map("old_value")
  newValue      Json?     @map("new_value")
  ipAddress     String?   @map("ip_address")
  userAgent     String?   @map("user_agent")
  createdAt     DateTime  @default(now()) @map("created_at")

  @@map("audit_logs")
}

model SlaConfig {
  id              String    @id @default(uuid())
  agencyType      String    @map("agency_type")
  severity        String
  targetMinutes   Int       @map("target_minutes")
  warningMinutes  Int       @map("warning_minutes")
  updatedById     String    @map("updated_by_id")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  createdAt       DateTime  @default(now()) @map("created_at")

  @@unique([agencyType, severity])
  @@map("sla_configs")
}

model SystemConfig {
  id        String    @id @default(uuid())
  key       String    @unique
  value     String
  label     String
  category  String
  updatedById String  @map("updated_by_id")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("system_configs")
}

model BroadcastAlert {
  id            String    @id @default(uuid())
  title         String
  message       String
  district      String?
  severity      String    @default("INFO")
  issuedById    String    @map("issued_by_id")
  targetCount   Int       @default(0) @map("target_count")
  deliveredCount Int      @default(0) @map("delivered_count")
  isActive      Boolean   @default(true) @map("is_active")
  expiresAt     DateTime? @map("expires_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  @@map("broadcast_alerts")
}
```

Run migration:
```bash
cd apps/api && npx prisma migrate dev --name add_admin_models
```

---

### A3. Audit Middleware

Create `apps/api/src/audit/audit.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

/**
 * Automatically logs every write operation (POST, PATCH, PUT, DELETE)
 * to the audit_logs table.
 *
 * Captures:
 *   - actorId + actorRole from req.user
 *   - action: METHOD + path (e.g. "PATCH /incidents/abc123/status")
 *   - resourceType: inferred from path (e.g. "incident", "officer", "user")
 *   - resourceId: inferred from path params
 *   - ipAddress: req.ip
 *   - userAgent: req.headers['user-agent']
 *
 * Must NOT log:
 *   - GET requests (read-only)
 *   - /auth endpoints (sensitive)
 *   - /health endpoint
 *
 * Performance: write to audit log AFTER the response is sent
 * using res.on('finish') to avoid slowing down the API.
 */
export function auditLogger(req: Request, res: Response, next: NextFunction) {
  const skipPaths = ['/health', '/v1/auth', '/v1/tips'];
  const skipMethods = ['GET', 'OPTIONS', 'HEAD'];

  next();

  res.on('finish', async () => {
    if (skipMethods.includes(req.method)) return;
    if (skipPaths.some(p => req.path.startsWith(p))) return;
    if (res.statusCode >= 400) return; // Only log successful operations

    const pathParts = req.path.split('/').filter(Boolean);
    const resourceType = pathParts[1] ?? 'unknown'; // e.g. "incidents"
    const resourceId = pathParts[2] ?? null;        // e.g. "abc-123"

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: `${req.method} ${req.path}`,
        resourceType,
        resourceId,
        newValue: ['POST', 'PATCH', 'PUT'].includes(req.method) ? req.body : null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? null,
      },
    }).catch(() => {}); // Never crash the server for an audit log failure
  });
}
```

Add to `apps/api/src/app.ts` after auth middleware:
```typescript
import { auditLogger } from './audit/audit.middleware';
app.use(auditLogger);
```

---

### A4. Admin Service

Create `apps/api/src/modules/admin/admin.service.ts`:

```typescript
import { prisma } from '../../config/database';
import { AgencyType, Role } from '@prisma/client';
import { socketEmit } from '../../socket/socket';

export const adminService = {

  /**
   * Returns national statistics across ALL agencies.
   * Supports date range filter (default: last 30 days).
   * Returns:
   *   totalIncidents, openIncidents, resolvedIncidents, closedIncidents
   *   byAgency: { POLICE: {total, open, resolved}, HOSPITAL: {...}, FIRE: {...}, RIB: {...} }
   *   byType: count per IncidentType
   *   byDistrict: top 10 districts by incident count
   *   bySeverity: count per severity
   *   avgResponseTimeMinutes: across all agencies
   *   slaBreachRate: % of cases that exceeded their SLA target
   *   dailyTrend: [{date, count}] for charting
   */
  async getNationalStats(from: Date, to: Date),

  /**
   * Returns agency performance scorecard for all 4 agencies.
   * For each agency:
   *   totalCases, resolvedCases, resolutionRate (%)
   *   avgResponseTimeMinutes
   *   slaBreachCount, slaBreachRate (%)
   *   openCases, criticalOpen
   *   officerCount, onDutyCount
   *   performanceScore: calculated 0-100
   *     Formula: 40% resolution rate + 30% SLA compliance + 30% avg response time score
   */
  async getAgencyScorecard(),

  /**
   * Returns all incidents across all agencies for the national map.
   * Only active incidents (not CLOSED/CANCELLED).
   * Returns minimal data: id, trackingCode, type, severity,
   *   status, latitude, longitude, targetAgency, createdAt.
   */
  async getNationalMapData(),

  /**
   * Returns incident density data for heat map.
   * Groups incidents by GPS coordinates (rounded to 2 decimal places).
   * Supports time range filter.
   * Returns: [{lat, lng, weight}] where weight = incident count at that location.
   */
  async getHeatMapData(from: Date, to: Date),

  /**
   * Returns animated heat map data — array of time frames.
   * Each frame = one day's incident density snapshot.
   * Used to animate the heat map over time.
   * Returns: [{date, points: [{lat, lng, weight}]}]
   */
  async getAnimatedHeatMapData(from: Date, to: Date),

  /**
   * Lists all users with filters.
   * Filters: role, isActive, isVerified, search (name/phone).
   * Includes officer profile if role is not CITIZEN.
   */
  async listUsers(filters: UserFilters, page: number, limit: number),

  /**
   * Creates a new officer account.
   * Creates User + Officer record in one transaction.
   * Sends welcome SMS with login instructions.
   */
  async createOfficerAccount(data: CreateOfficerInput, createdById: string),

  /**
   * Suspends a user account (sets isActive = false).
   * Revokes all active refresh tokens.
   * Logs to audit_log.
   */
  async suspendUser(userId: string, reason: string, suspendedById: string),

  /**
   * Reactivates a suspended user account.
   */
  async reactivateUser(userId: string, reactivatedById: string),

  /**
   * Sends a broadcast push notification to all app users
   * or all users in a specific district.
   *
   * Uses Firebase Cloud Messaging topic messaging:
   *   All users: topic = "all_users"
   *   By district: topic = "district_Gasabo", "district_Kicukiro", etc.
   *
   * Also creates a BroadcastAlert record.
   * Returns: { alertId, targetCount, message: "Alert sent" }
   */
  async sendBroadcastAlert(data: BroadcastAlertInput, issuedById: string),

  /**
   * Returns paginated audit log with filters.
   * Filters: actorId, resourceType, action, dateFrom, dateTo.
   */
  async getAuditLog(filters: AuditFilters, page: number, limit: number),

  /**
   * Exports anonymized incident data as CSV or JSON.
   * Anonymization rules:
   *   - Remove: reporterId, reporter name/phone, exact address
   *   - Keep: trackingCode, type, severity, status, district,
   *           latitude (rounded to 2dp), longitude (rounded to 2dp),
   *           createdAt (date only, no time), targetAgency, resolvedAt
   * Returns: file buffer (CSV or JSON based on format param).
   */
  async exportOpenData(from: Date, to: Date, format: 'csv' | 'json'),

  /**
   * Returns system health status.
   * Checks: API server (always OK if this runs), DB connection,
   *   Redis connection, Supabase Storage, last incident created at.
   * Returns: { api: 'UP', database: 'UP'|'DOWN', redis: 'UP'|'DOWN',
   *            storage: 'UP'|'DOWN', lastActivity: ISO date }
   */
  async getSystemHealth(),
};
```

---

### A5. SLA Service

Create `apps/api/src/modules/sla/sla.service.ts`:

```typescript
export const slaService = {

  /**
   * Returns all SLA configs.
   * Default configs (seeded):
   *   POLICE + CRITICAL = 10 min target, 7 min warning
   *   POLICE + HIGH     = 15 min target, 10 min warning
   *   POLICE + MEDIUM   = 30 min target, 20 min warning
   *   POLICE + LOW      = 60 min target, 45 min warning
   *   HOSPITAL + CRITICAL = 8 min target, 5 min warning
   *   HOSPITAL + HIGH   = 12 min target, 8 min warning
   *   FIRE + CRITICAL   = 8 min target, 5 min warning
   *   FIRE + HIGH       = 12 min target, 8 min warning
   *   RIB + CRITICAL    = 60 min target, 40 min warning
   *   RIB + HIGH        = 120 min target, 90 min warning
   */
  async getSlaConfigs(),

  /**
   * Updates an SLA config.
   * Only SUPER_ADMIN can call this.
   * Emits Socket.io "sla:updated" event so all dashboards update their timers.
   */
  async updateSlaConfig(id: string, targetMinutes: number, warningMinutes: number, updatedById: string),

  /**
   * Returns SLA breach report for a date range.
   * For each breach: incidentId, trackingCode, severity, agency,
   *   timeToDispatch (minutes), targetMinutes, breachMinutes (how far over target).
   */
  async getSlaBreachReport(from: Date, to: Date, agencyType?: string),
};
```

---

### A6. Admin API Endpoints

Register all in `apps/api/src/app.ts` — all require SUPER_ADMIN role:

```
# National Stats & Analytics
GET    /v1/admin/stats                    National statistics summary
GET    /v1/admin/scorecard                Agency performance scorecards
GET    /v1/admin/map                      All active incidents for national map
GET    /v1/admin/heatmap                  Heat map density data
GET    /v1/admin/heatmap/animated         Animated heat map (time-lapse data)

# User Management
GET    /v1/admin/users                    List all users with filters
POST   /v1/admin/users/officer            Create new officer account
PATCH  /v1/admin/users/:id/suspend        Suspend user account
PATCH  /v1/admin/users/:id/reactivate     Reactivate user account
DELETE /v1/admin/users/:id               Delete user (soft delete)
GET    /v1/admin/users/:id               Get user detail + activity

# Broadcast
POST   /v1/admin/broadcast               Send broadcast alert to users
GET    /v1/admin/broadcasts              List past broadcast alerts
DELETE /v1/admin/broadcasts/:id         Deactivate a broadcast alert

# SLA Management
GET    /v1/sla                           Get all SLA configs
PATCH  /v1/sla/:id                       Update SLA config
GET    /v1/sla/breaches                  Get SLA breach report

# System
GET    /v1/admin/audit                   Paginated audit log
GET    /v1/admin/health                  System health check
GET    /v1/admin/config                  Get system configs
PATCH  /v1/admin/config/:key             Update system config

# Open Data
GET    /v1/opendata/export               Export anonymized data (CSV/JSON)
GET    /v1/opendata/summary              Public summary stats (no auth)
```

---

### A7. SLA Default Seed Data

Add to `apps/api/src/database/seed.ts`:

```typescript
const slaConfigs = [
  // Police SLA targets
  { agencyType: 'POLICE', severity: 'CRITICAL', targetMinutes: 10, warningMinutes: 7 },
  { agencyType: 'POLICE', severity: 'HIGH',     targetMinutes: 15, warningMinutes: 10 },
  { agencyType: 'POLICE', severity: 'MEDIUM',   targetMinutes: 30, warningMinutes: 20 },
  { agencyType: 'POLICE', severity: 'LOW',      targetMinutes: 60, warningMinutes: 45 },
  // Hospital SLA targets
  { agencyType: 'HOSPITAL', severity: 'CRITICAL', targetMinutes: 8,  warningMinutes: 5 },
  { agencyType: 'HOSPITAL', severity: 'HIGH',     targetMinutes: 12, warningMinutes: 8 },
  { agencyType: 'HOSPITAL', severity: 'MEDIUM',   targetMinutes: 20, warningMinutes: 14 },
  { agencyType: 'HOSPITAL', severity: 'LOW',      targetMinutes: 45, warningMinutes: 30 },
  // Fire SLA targets
  { agencyType: 'FIRE', severity: 'CRITICAL', targetMinutes: 8,  warningMinutes: 5 },
  { agencyType: 'FIRE', severity: 'HIGH',     targetMinutes: 12, warningMinutes: 8 },
  { agencyType: 'FIRE', severity: 'MEDIUM',   targetMinutes: 20, warningMinutes: 14 },
  { agencyType: 'FIRE', severity: 'LOW',      targetMinutes: 60, warningMinutes: 45 },
  // RIB SLA targets (investigations take longer)
  { agencyType: 'RIB', severity: 'CRITICAL', targetMinutes: 60,  warningMinutes: 40 },
  { agencyType: 'RIB', severity: 'HIGH',     targetMinutes: 120, warningMinutes: 90 },
  { agencyType: 'RIB', severity: 'MEDIUM',   targetMinutes: 240, warningMinutes: 180 },
  { agencyType: 'RIB', severity: 'LOW',      targetMinutes: 480, warningMinutes: 360 },
];
```

---

### A8. Update SLATimer to Use Dynamic Config

Update `apps/dashboard-police/src/components/incidents/SLATimer.tsx` (and all other dashboards) to fetch the SLA config from the API instead of using hardcoded 15 minutes:

```typescript
// Instead of hardcoded:
const SLA_LIMIT_MINUTES = 15;

// Fetch from API on mount:
const { data: slaConfig } = useQuery(['sla', agencyType, severity], () =>
  apiClient.get(`/sla`).then(r => r.data.data.find(
    (c: any) => c.agencyType === agencyType && c.severity === severity
  ))
);

const targetMinutes = slaConfig?.targetMinutes ?? 15;
const warningMinutes = slaConfig?.warningMinutes ?? 10;
```

---

## Part B — Super Admin Dashboard Next.js App

### B1. Setup

```bash
cp -r apps/dashboard-police apps/dashboard-admin
cd apps/dashboard-admin

NEXT_PUBLIC_AGENCY_TYPE=ADMIN
NEXT_PUBLIC_APP_NAME=Rwanda Safe — Government Control Center
```

### B2. Admin Theme

```typescript
export const AdminTheme = {
  sidebar:        '#0F172A',   // Deep dark slate
  sidebarActive:  '#1E3A5F',
  topbar:         '#FFFFFF',
  background:     '#F1F5F9',
  surface:        '#FFFFFF',
  border:         '#E2E8F0',
  primary:        '#0F4C75',   // Deep government blue
  primaryHover:   '#0A3558',
  accent:         '#F59E0B',   // Gold accent

  // Agency colors (used on scorecard + map)
  police:   '#1B5E82',
  hospital: '#C62828',
  fire:     '#EA580C',
  rib:      '#4C1D95',

  // Performance score colors
  scoreExcellent: '#22C55E',  // 80-100
  scoreGood:      '#84CC16',  // 60-79
  scoreFair:      '#F59E0B',  // 40-59
  scorePoor:      '#EF4444',  // 0-39
};
```

### B3. Folder Structure

```
apps/dashboard-admin/src/
├── app/
│   ├── login/page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx                    # National overview
│       ├── map/page.tsx                # National incident map
│       ├── heatmap/page.tsx            # Animated heat map
│       ├── agencies/page.tsx           # Agency comparison
│       ├── agencies/[type]/page.tsx    # Single agency drill-down
│       ├── users/page.tsx              # User management
│       ├── users/new/page.tsx          # Create officer account
│       ├── broadcast/page.tsx          # Broadcast alerts
│       ├── sla/page.tsx                # SLA configuration
│       ├── audit/page.tsx              # Audit log
│       ├── opendata/page.tsx           # Open data export
│       └── system/page.tsx             # System health
├── components/
│   ├── layout/
│   │   ├── AdminSidebar.tsx
│   │   └── AdminTopbar.tsx
│   ├── stats/
│   │   ├── NationalStatCards.tsx
│   │   ├── AgencyScorecard.tsx
│   │   ├── AgencyComparisonChart.tsx
│   │   ├── NationalTrendChart.tsx
│   │   ├── DistrictBreakdown.tsx
│   │   └── IncidentTypeBreakdown.tsx
│   ├── map/
│   │   ├── NationalMap.tsx
│   │   ├── AnimatedHeatMap.tsx
│   │   └── AgencyFilterPanel.tsx
│   ├── users/
│   │   ├── UsersTable.tsx
│   │   ├── CreateOfficerForm.tsx
│   │   ├── UserDetailPanel.tsx
│   │   └── SuspendModal.tsx
│   ├── broadcast/
│   │   ├── BroadcastForm.tsx
│   │   ├── BroadcastHistoryTable.tsx
│   │   └── DistrictSelector.tsx
│   ├── sla/
│   │   ├── SlaConfigTable.tsx
│   │   ├── SlaEditModal.tsx
│   │   └── SlaBreachReport.tsx
│   ├── audit/
│   │   ├── AuditLogTable.tsx
│   │   └── AuditFilters.tsx
│   └── system/
│       ├── SystemHealthCard.tsx
│       └── SystemConfigTable.tsx
```

---

### B4. Screen Specifications

#### `app/dashboard/page.tsx` — National Overview

This is the most important page in the entire Rwanda Safe system — government leadership sees this first.

**Header:**
```
Rwanda Safe — National Emergency Response Dashboard
Last updated: 2 minutes ago  [Refresh]
```

**Top Row — 6 National KPI Cards:**

| Card | Value | Icon | Color |
|---|---|---|---|
| Total Incidents Today | count | 📊 | Blue |
| Currently Open | count | 🔴 | Red |
| Resolved Today | count | ✅ | Green |
| Avg Response Time | X min | ⏱️ | Orange |
| SLA Compliance Rate | X% | 📋 | Purple |
| Active Officers | count | 👮 | Teal |

**Second Row — Agency Status Row (4 cards, one per agency):**

Each card shows:
```
[Agency Icon + Name]
Open: 12  |  Resolved Today: 8
Avg Response: 14 min
Performance Score: 78/100  ████████░░
[View Dashboard ↗]
```
Color coded: green border if score > 70, yellow if 40-70, red if < 40.

**Third Row — National Trend Chart (left 60%) + District Breakdown (right 40%)**

National Trend Chart:
- Line chart showing total incidents per day for last 30 days
- 4 colored lines: Police (blue), Hospital (red), Fire (orange), RIB (purple)
- X-axis: dates, Y-axis: incident count
- Hover tooltip shows exact counts per agency

District Breakdown:
- Horizontal bar chart: top 10 districts by total incidents
- Color each bar by dominant incident type in that district
- Click district bar → filters national map to that district

**Fourth Row — Recent Critical Incidents (full width)**

Table of last 10 CRITICAL severity incidents across all agencies:
- Tracking code, type, agency, district, status, time ago, SLA status
- "Open" button → opens in the relevant agency dashboard (new tab)

---

#### `app/dashboard/map/page.tsx` — National Incident Map

Full-screen map showing ALL active incidents across all agencies.

**Left control panel (320px wide):**

Agency filter toggles:
```
✅ 🔵 Police (23 active)
✅ 🔴 Hospital (8 active)
✅ 🟠 Fire (3 active)
✅ 🟣 RIB (5 active)
```

Severity filter:
```
✅ Critical (5)
✅ High (18)
✅ Medium (12)
✅ Low (4)
```

Status filter:
```
✅ Received
✅ Under Review
✅ Assigned
✅ Dispatched/On Scene
☐ Resolved
```

District filter:
- Dropdown: All Districts / [list of Rwanda's 30 districts]

Date range:
- Today / Last 7 days / Last 30 days / Custom

**Map:**
- Agency-colored pins (blue=police, red=hospital, orange=fire, purple=rib)
- Pin shape by severity: circle=low/medium, diamond=high, star=critical
- Click pin → popup with: agency badge, tracking code, type, status, time since created, "Open Case" button
- Cluster markers when zoomed out (show count bubble)

**Agency stations layer (toggleable):**
- Police station markers (badge icon)
- Hospital markers (H icon)
- Fire station markers (fire icon)

**Statistics strip at map bottom:**
```
Total visible: 39 incidents  |  Critical: 5  |  Oldest open: 4h 23m ago
```

---

#### `app/dashboard/heatmap/page.tsx` — Animated Heat Map

**Controls bar:**
```
Date range: [From: 2026-05-01] [To: 2026-05-30]
Agency: [All ▼]    Incident type: [All ▼]
[Generate Heat Map]
```

**Map with heat map overlay:**
- Standard Google Maps with heat map layer
- Intensity = incident count per GPS cluster
- Color scale: blue (low) → yellow (medium) → red (high density)

**Animation controls (below map):**
```
[◀◀ First] [◀ Prev] [⏸ Pause] [▶ Play] [▶ Next] [▶▶ Last]
Speed: [●○○ Slow] [○●○ Normal] [○○● Fast]

Timeline scrubber: ─────●─────────────────
May 1          May 15                May 30

Current frame: May 14, 2026 — 234 incidents
```

When playing:
- Each frame = 1 day
- Heat map updates smoothly (CSS transition)
- Frame label updates: "May 14 — 234 incidents"
- Districts that spike in intensity get a brief label overlay

**Insight panel (right of map, 280px):**
```
🔥 Hotspot Districts (this period)
1. Gasabo — 312 incidents
2. Nyarugenge — 245 incidents
3. Kicukiro — 198 incidents

📈 Peak day: May 18 (67 incidents)
📉 Quietest: May 3 (12 incidents)
📊 Daily average: 31 incidents
```

---

#### `app/dashboard/agencies/page.tsx` — Agency Comparison

**Page title:** "Agency Performance Comparison"

**Date range picker** at top.

**Performance scorecard grid (4 cards, 2×2):**

Each card:
```
┌─────────────────────────────────┐
│ 🔵 RWANDA NATIONAL POLICE       │
│                                 │
│ Score: 78/100  ████████░░  Good │
│                                 │
│ Total Cases:    342             │
│ Resolution Rate: 84%    ✅      │
│ Avg Response:   13 min  ✅      │
│ SLA Compliance: 79%     ⚠️      │
│ Open Critical:   3      ✅      │
│ Officers OnDuty: 12/24          │
│                                 │
│ [View Full Report]              │
└─────────────────────────────────┘
```

**Comparison charts (below cards):**

Left: **Response Time Comparison** — grouped bar chart
- X-axis: agencies
- Y-axis: minutes
- Groups: CRITICAL / HIGH / MEDIUM severity

Right: **Resolution Rate Comparison** — grouped bar chart
- X-axis: agencies
- Y-axis: percentage
- Reference line at 80% target

Bottom: **SLA Compliance Over Time** — line chart
- One line per agency
- X-axis: last 12 weeks
- Y-axis: SLA compliance %
- Reference line at 90% target

---

#### `app/dashboard/agencies/[type]/page.tsx` — Agency Drill-Down

Full detailed stats for one agency (POLICE, HOSPITAL, FIRE, or RIB).

Sections:
1. KPI summary (same as agency scorecard card but expanded)
2. Incident volume by type (pie chart)
3. Response time distribution (histogram)
4. SLA breach list (table of all breaches in date range)
5. District breakdown for this agency (bar chart)
6. Officer/unit utilization (table)
7. "Open [Agency] Dashboard" button (links to the agency's own dashboard)

---

#### `app/dashboard/users/page.tsx` — User Management

**Tabs: Citizens | Officers | All Users**

**Citizens tab:**
Table columns: Phone, Name, Verified, Joined Date, Total Reports, Last Active, Status, Actions

**Officers tab:**
Table columns: Name, Badge, Role, Agency, Rank, On Duty, Open Cases, Last Login, Status, Actions

**Actions per row:**
- View Details (side panel)
- Suspend (opens SuspendModal)
- Reactivate (if suspended)
- Delete (soft delete, confirmation required)

**Search bar:** search by name, phone, or badge number.

**"Create Officer Account" button** → `/dashboard/users/new`

---

#### `app/dashboard/users/new/page.tsx` — Create Officer Account

Full-width form:

```
Section 1 — Account Details
  Phone number*       [+250 __________]
  Full name*          [________________]
  Email (optional)    [________________]
  Role*               [Police Officer ▼]
    Options: Police Officer / Medical Responder / Fire Officer / RIB Investigator

Section 2 — Agency Assignment
  Agency*             [Rwanda National Police (RNP) ▼]
    (filtered by role)
  Badge number        [________________]
  Rank                [Constable ▼]
    Options: Constable / Corporal / Sergeant / Inspector / Superintendent / Commissioner

Section 3 — Notification
  ✅ Send welcome SMS to officer with login instructions

[Cancel]  [Create Officer Account]
```

On submit:
- Calls `POST /v1/admin/users/officer`
- Shows success: "Officer account created. Welcome SMS sent to [phone]."

---

#### `app/dashboard/broadcast/page.tsx` — Broadcast Alerts

**Send New Alert form (top):**

```
Title*        [________________________________]
Message*      [________________________________]
              (max 160 characters — SMS friendly)

Severity      ○ Info  ○ Warning  ○ Danger  ● Critical

Target
  ○ All users in Rwanda
  ● Specific districts (select below)

Districts     [✅ Gasabo] [✅ Kicukiro] [☐ Nyarugenge] [☐ Musanze] ...
              (show all 30 Rwanda districts as toggleable chips)

Expires       [Date picker — optional]

Estimated recipients: ~24,500 users

[Send Broadcast Alert]
```

On send:
- Shows confirmation modal: "You are about to send an alert to ~24,500 users in Gasabo and Kicukiro. This cannot be undone. Confirm?"
- On confirm: calls `POST /v1/admin/broadcast`
- Shows: "Alert sent successfully to 24,312 users."

**Broadcast history table (below form):**

| Title | Severity | Target | Sent To | Delivered | Sent By | Date | Status | Actions |
|---|---|---|---|---|---|---|---|---|
| Road closure KG 7 | Warning | Gasabo | 12,400 | 11,892 | Admin | May 29 | Active | Deactivate |

---

#### `app/dashboard/sla/page.tsx` — SLA Configuration

**Explanation banner:**
```
ℹ️ SLA targets define the maximum time allowed before a case must be 
dispatched/assigned. Warning time triggers the yellow alert. 
Target time triggers the red alert on officer dashboards.
```

**SLA Config Table:**

| Agency | Severity | Warning (min) | Target (min) | Last Updated | Actions |
|---|---|---|---|---|---|
| Police | CRITICAL | 7 min | 10 min | May 1 | Edit |
| Police | HIGH | 10 min | 15 min | May 1 | Edit |
| Hospital | CRITICAL | 5 min | 8 min | May 1 | Edit |
| ... | | | | | |

Click **Edit** → opens `SlaEditModal`:
```
Agency: Police     Severity: CRITICAL

Warning time:  [7] minutes  (SLA timer turns yellow)
Target time:   [10] minutes (SLA timer turns red)

[Cancel]  [Save Changes]
```

On save:
- Updates config
- Emits `sla:updated` Socket.io event
- All officer dashboards update their SLA timers in real-time

**SLA Breach Report (below table):**

Date range picker + agency filter.

Table:
| Tracking Code | Agency | Severity | Time to Dispatch | Target | Over by | Officer |
|---|---|---|---|---|---|---|
| RW-2026-00341 | Police | HIGH | 23 min | 15 min | +8 min | Officer Nkusi |

Export CSV button.

---

#### `app/dashboard/audit/page.tsx` — Audit Log

**Filter bar:**
- Actor (search by name/phone)
- Resource type (incident / user / investigation / ambulance / etc.)
- Action (filter by HTTP method or specific action)
- Date range

**Audit log table:**

| Timestamp | Actor | Role | Action | Resource | Details |
|---|---|---|---|---|---|
| May 30 14:23 | Officer Nkusi | Police | PATCH /incidents/abc/status | incident:abc | Status: DISPATCHED → ON_SCENE |
| May 30 14:21 | Dr. Uwase | Hospital | POST /medical/xyz/dispatch | medical:xyz | Dispatched AMB-002 |
| May 30 14:19 | Admin | Admin | PATCH /admin/users/def/suspend | user:def | Reason: "Inactive account" |

- Click row → expanded detail panel showing old value / new value as JSON diff

**Export:** "Export Audit Log (CSV)" button.

---

#### `app/dashboard/opendata/page.tsx` — Open Data Export

**Intro section:**
```
📊 Open Data Portal

Rwanda Safe publishes anonymized, aggregated incident data to support 
researchers, journalists, and urban planners. All data is fully anonymized —
no personal information is included.

Data includes: incident type, severity, district, date (no time), 
rounded GPS coordinates, agency, resolution status.
```

**Export form:**
```
Date range:   [From: 2026-01-01] [To: 2026-05-30]
Format:       ● CSV   ○ JSON
Agency:       ● All  ○ Police only  ○ Hospital only  ○ Fire only
Include:      ✅ Resolved cases  ✅ Closed cases  ☐ Open cases

Estimated records: ~3,240 incidents

[Download Export]
```

On download: calls `GET /v1/opendata/export?from=...&to=...&format=csv`
Returns file download with filename: `rwanda-safe-opendata-2026-05.csv`

**Monthly summary stats (below, public — no auth):**
```
May 2026 Summary
Total incidents: 1,247
Most common type: Accident (34%)
Most affected district: Gasabo (28%)
Overall resolution rate: 87%
Average response time: 14 minutes
```

---

#### `app/dashboard/system/page.tsx` — System Health

**Health status grid:**

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 🟢 API Server    │  │ 🟢 Database       │  │ 🟢 Redis Cache   │
│ Status: UP       │  │ Status: UP        │  │ Status: UP       │
│ Uptime: 14 days  │  │ Response: 12ms    │  │ Memory: 24MB     │
│ Version: 1.0.0   │  │ Connections: 8    │  │ Keys: 1,240      │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 🟢 File Storage  │  │ 🟢 Notifications  │  │ 🟡 SMS Service   │
│ Status: UP       │  │ Status: UP        │  │ Status: DEGRADED │
│ Used: 2.4 GB     │  │ FCM: Connected    │  │ Delivery: 94%    │
│ Free: 22.6 GB    │  │ Queue: 0 pending  │  │ AT API: Slow     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Recent activity:**
```
Last incident created:    2 minutes ago (RW-2026-01247)
Last user login:          30 seconds ago
Last status update:       1 minute ago
Database backups:         Last backup: May 30 02:00 AM ✅
```

**System config table:**

| Config Key | Value | Category | Last Updated |
|---|---|---|---|
| otp_expires_minutes | 5 | Auth | May 1 |
| max_file_size_mb | 20 | Upload | May 1 |
| incident_photo_limit | 5 | Upload | May 1 |
| anonymous_reporting | enabled | Features | May 1 |

Click value → inline edit.

---

### B5. Key Hooks

#### `hooks/useNationalStats.ts`
```typescript
/**
 * Fetches national statistics with auto-refresh every 60 seconds.
 * Supports date range filter.
 * Returns: stats, isLoading, dateRange, setDateRange, refresh
 */
```

#### `hooks/useAgencyScorecard.ts`
```typescript
/**
 * Fetches agency performance scorecards.
 * Auto-refresh every 5 minutes.
 * Returns: scorecards, isLoading, lastUpdated
 */
```

#### `hooks/useNationalMap.ts`
```typescript
/**
 * Fetches all active incident coordinates.
 * Combines with Socket.io real-time updates.
 * Supports agency + severity + district filters (client-side filtering).
 * Returns: incidents, filters, setFilters, isLoading
 */
```

---

## Part C — Backend Tests for Chapter 6

Create `apps/api/src/modules/admin/admin.test.ts`:

1. `GET /v1/admin/stats` — returns correct total incident count for date range
2. `GET /v1/admin/stats` — citizen role returns 403
3. `GET /v1/admin/scorecard` — returns scorecard for all 4 agencies
4. `GET /v1/admin/map` — does not include CLOSED or CANCELLED incidents
5. `POST /v1/admin/users/officer` — creates User + Officer record in one transaction
6. `PATCH /v1/admin/users/:id/suspend` — sets isActive=false, revokes refresh tokens
7. `POST /v1/admin/broadcast` — creates BroadcastAlert record
8. `PATCH /v1/sla/:id` — updates config, emits sla:updated Socket.io event
9. `GET /v1/admin/audit` — returns logs sorted by createdAt DESC
10. `GET /v1/opendata/export?format=csv` — returns CSV with no personal data (no phone, no name)
11. `GET /v1/opendata/export?format=json` — returns JSON with correct fields
12. Audit middleware: `PATCH /incidents/:id/status` creates an AuditLog record
13. Audit middleware: does NOT create AuditLog for GET requests
14. `GET /v1/admin/health` — returns health status object

---

## Definition of Done for Chapter 6

**Backend**
- [ ] All admin models migrated (`AuditLog`, `SlaConfig`, `SystemConfig`, `BroadcastAlert`)
- [ ] SLA configs seeded (16 configs — 4 agencies × 4 severities)
- [ ] Audit middleware logs all write operations to `audit_logs` table
- [ ] Audit middleware does NOT log GET or `/auth` requests
- [ ] `POST /v1/admin/broadcast` sends FCM topic notification
- [ ] `GET /v1/opendata/export` CSV contains NO personal data (verified in test)
- [ ] `PATCH /v1/sla/:id` emits `sla:updated` Socket.io event
- [ ] All 14 admin tests pass

**Super Admin Dashboard**
- [ ] Runs on port 3005 (`npm run dev -- --port 3005`)
- [ ] Only SUPER_ADMIN role can log in (all other roles rejected)
- [ ] National overview loads 6 KPI cards populated from API
- [ ] 4 agency status cards show correct open/resolved counts
- [ ] National trend chart shows 30-day line chart per agency
- [ ] National map shows all active incidents with agency-colored pins
- [ ] Agency filter toggles show/hide pins correctly
- [ ] Heat map renders with correct density visualization
- [ ] Animated heat map plays frame by frame correctly
- [ ] Agency comparison scorecard shows performance scores
- [ ] Users table lists all users with suspend/reactivate actions
- [ ] "Create Officer Account" form creates user + officer in DB and sends SMS
- [ ] Broadcast form sends alert to target districts
- [ ] District selector shows all 30 Rwanda districts as chips
- [ ] SLA config table loads all 16 configs
- [ ] Editing SLA config saves and updates all dashboards in real-time
- [ ] SLA breach report exports to CSV correctly
- [ ] Audit log table shows all write operations with actor info
- [ ] Open data export downloads anonymized CSV/JSON
- [ ] System health page shows UP/DOWN for all 6 services

---

## Notes for Developer

- Admin dashboard runs on port **3005**
- The animated heat map is computationally heavy. Use `requestAnimationFrame` for smooth transitions and limit the frame rate to max 2 frames per second during playback
- For the animated heat map, the Google Maps `HeatmapLayer` library must be loaded: `loader.load({ libraries: ['visualization'] })`
- When calculating performance scores: use a weighted formula (40% resolution rate + 30% SLA compliance + 30% response time score). For response time score: 100 if avg < target, scaled down proportionally up to 2× target = 0 score
- The open data CSV export should use `fast-csv` or plain string building: `npm install fast-csv`. Never include raw user IDs in the export
- FCM topic messaging requires devices to subscribe to topics. Add topic subscription in the mobile app: `messaging().subscribeToTopic('all_users')` on login, and `messaging().subscribeToTopic('district_Gasabo')` etc. based on user's district
- The `sla:updated` Socket.io event should be received by all dashboard clients and trigger a React Query cache invalidation for the SLA config query — the SLATimer component will then re-render with new targets
- `GET /v1/opendata/summary` is a public endpoint (no auth) — this is intentionally accessible by anyone and can be embedded in government websites
- Refer to Rwanda Safe SSD v1.0, Chapter 9 for the full Super Admin feature specification

---

*End of Chapter 6 Developer Prompt — Rwanda Safe v1.0*
