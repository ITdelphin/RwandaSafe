# Rwanda Safe — Full Developer Prompt: Chapter 3 (Police Dashboard)

> **Document Reference:** Rwanda Safe SSD v1.0, Chapter 5  
> **Depends on:** Chapter 1 ✅ and Chapter 2 ✅ fully completed  
> **Purpose:** Build the complete Rwanda National Police (RNP) dashboard — a web application where police officers receive, triage, assign, and resolve crime and accident reports in real time.

---

## What This Chapter Builds

By the end of Chapter 3 your developer will have:

1. Police dashboard Next.js app — fully working with all screens
2. Officer authentication (separate login from citizen auth)
3. Live incident feed with real-time Socket.io updates
4. Live incident map (Google Maps with incident pins + officer unit markers)
5. Full case management — view, assign, update status, add notes
6. Cross-agency forwarding (send case to Hospital or Fire brigade)
7. Officer management panel
8. SLA timer (goes red when case waits more than 15 minutes)
9. Shift handover log
10. Basic analytics for the police dashboard
11. New backend API endpoints required by the dashboard
12. Full test coverage for the new endpoints

---

## Part A — Backend: New API Endpoints for Police Dashboard

### A1. New Files to Create

Add these inside `apps/api/src/modules/`:

```
modules/
├── dashboard/
│   ├── dashboard.router.ts
│   ├── dashboard.controller.ts
│   └── dashboard.service.ts
├── officers/
│   ├── officers.router.ts
│   ├── officers.controller.ts
│   ├── officers.service.ts
│   └── officers.schema.ts
├── resources/
│   ├── resources.router.ts
│   ├── resources.controller.ts
│   └── resources.service.ts
└── agencies/
    ├── agencies.router.ts
    ├── agencies.controller.ts
    └── agencies.service.ts
```

---

### A2. Dashboard Service

Create `apps/api/src/modules/dashboard/dashboard.service.ts` with these functions:

```typescript
import { prisma } from '../../config/database';
import { AgencyType, IncidentStatus } from '@prisma/client';

export const dashboardService = {

  /**
   * Returns paginated incidents routed to a specific agency type.
   * Supports filters: status, type, severity, district, dateFrom, dateTo, search.
   * Includes: reporter info (if not anonymous), assignment, latest note, media count.
   * Ordered by: severity DESC, createdAt DESC.
   */
  async getAgencyIncidents(agencyType: AgencyType, filters: DashboardFilters, page: number, limit: number),

  /**
   * Returns all incident coordinates for the map view.
   * Only active incidents (not CLOSED or CANCELLED).
   * Returns: id, trackingCode, type, severity, status, latitude, longitude, createdAt.
   * Used to draw pins on the live map.
   */
  async getIncidentMapData(agencyType: AgencyType),

  /**
   * Returns dashboard summary stats for a given agency:
   * - totalToday: incidents received today
   * - openCases: currently open (not resolved/closed)
   * - avgResponseTimeMinutes: average time from RECEIVED to DISPATCHED today
   * - criticalOpen: open cases with severity CRITICAL
   * - resolvedToday: resolved today
   * - byStatus: count per status
   * - byType: count per incident type
   * - byDistrict: count per district (top 5)
   */
  async getAgencyStats(agencyType: AgencyType),

  /**
   * Returns list of all on-duty officers for an agency with:
   * - name, badge number, rank
   * - current GPS location (if available)
   * - number of open assigned cases
   * - status: AVAILABLE or BUSY
   */
  async getOnDutyOfficers(agencyId: string),

  /**
   * Forwards an incident to another agency.
   * Creates a new Assignment record for the target agency.
   * Emits Socket.io "incident:new" to the target agency room.
   * Adds an internal case note: "Forwarded to [agency] by [officer]"
   * Does NOT remove the incident from the originating agency.
   */
  async forwardToAgency(incidentId: string, targetAgency: AgencyType, forwardedById: string, note?: string),

  /**
   * Returns all cases assigned to a specific officer that are still open.
   * Used for the shift handover log.
   */
  async getOfficerOpenCases(officerId: string),

  /**
   * Creates a shift handover log entry.
   * Captures: officer going off duty, open case list, summary note, timestamp.
   * Stores in a new ShiftHandover table (add to Prisma schema).
   */
  async createShiftHandover(officerId: string, summary: string),
};
```

---

### A3. New Prisma Models (add to schema.prisma)

Add these two new models to `apps/api/prisma/schema.prisma`:

```prisma
model ShiftHandover {
  id            String    @id @default(uuid())
  officerId     String    @map("officer_id")
  summary       String
  openCaseIds   String[]  @map("open_case_ids")
  createdAt     DateTime  @default(now()) @map("created_at")

  officer       Officer   @relation(fields: [officerId], references: [id])

  @@map("shift_handovers")
}

model ForwardLog {
  id              String      @id @default(uuid())
  incidentId      String      @map("incident_id")
  fromAgency      AgencyType  @map("from_agency")
  toAgency        AgencyType  @map("to_agency")
  forwardedById   String      @map("forwarded_by_id")
  note            String?
  createdAt       DateTime    @default(now()) @map("created_at")

  incident        Incident    @relation(fields: [incidentId], references: [id])

  @@map("forward_logs")
}
```

Also add `shiftHandovers ShiftHandover[]` to the `Officer` model and `forwardLogs ForwardLog[]` to the `Incident` model.

After editing, run:
```bash
cd apps/api && npx prisma migrate dev --name add_shift_handover_forward_log
```

---

### A4. Dashboard & Officers API Endpoints

Register all routes in `apps/api/src/app.ts`.

**Dashboard endpoints** (all require officer or admin role):
```
GET  /v1/dashboard/incidents          Paginated incident feed for caller's agency
GET  /v1/dashboard/map                All active incident coordinates for map
GET  /v1/dashboard/stats              Summary stats for caller's agency
GET  /v1/dashboard/officers           On-duty officers for caller's agency
POST /v1/dashboard/forward            Forward incident to another agency
POST /v1/dashboard/handover           Create shift handover log
GET  /v1/dashboard/handover/latest    Get latest handover log for officer
```

**Officers endpoints:**
```
GET    /v1/officers                   List all officers in caller's agency
GET    /v1/officers/:id               Get officer profile + open cases
PATCH  /v1/officers/:id/duty          Toggle on-duty status
PATCH  /v1/officers/:id/location      Update officer GPS location
```

**Resources endpoints:**
```
GET    /v1/resources                  List resources for caller's agency
PATCH  /v1/resources/:id/status       Update resource status
PATCH  /v1/resources/:id/location     Update resource GPS location
```

---

### A5. Middleware: Agency Guard

Create `apps/api/src/middleware/agencyGuard.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';

/**
 * Attaches the officer's agency info to req.officer.
 * Used by all dashboard endpoints to scope data to the correct agency.
 * Must be used AFTER requireAuth middleware.
 */
export async function agencyGuard(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'SUPER_ADMIN') {
    // Admin can see all agencies — no restriction
    return next();
  }

  const officer = await prisma.officer.findUnique({
    where: { userId: req.user!.id },
    include: { agency: true },
  });

  if (!officer) return sendError(res, 'Officer profile not found', 403);

  // Attach officer + agency to request
  (req as any).officer = officer;
  (req as any).agency = officer.agency;

  next();
}
```

---

## Part B — Police Dashboard Next.js App

### B1. Setup

Inside `apps/dashboard-police/` run:
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install @tanstack/react-query axios zustand socket.io-client
npm install @googlemaps/js-api-loader
npm install recharts date-fns
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-badge
npm install lucide-react
npm install react-hook-form zod @hookform/resolvers
```

### B2. Folder Structure

```
apps/dashboard-police/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with sidebar
│   │   ├── page.tsx                 # Redirect to /dashboard
│   │   ├── login/
│   │   │   └── page.tsx             # Officer login page
│   │   └── dashboard/
│   │       ├── layout.tsx           # Dashboard shell (sidebar + topbar)
│   │       ├── page.tsx             # Overview (stats + live feed)
│   │       ├── incidents/
│   │       │   ├── page.tsx         # Full incident list with filters
│   │       │   └── [id]/
│   │       │       └── page.tsx     # Single incident detail
│   │       ├── map/
│   │       │   └── page.tsx         # Live incident map
│   │       ├── officers/
│   │       │   └── page.tsx         # Officer management
│   │       ├── analytics/
│   │       │   └── page.tsx         # Charts and statistics
│   │       └── handover/
│   │           └── page.tsx         # Shift handover
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Left navigation sidebar
│   │   │   ├── Topbar.tsx           # Top bar with officer info + alerts
│   │   │   └── DashboardShell.tsx   # Wrapper for sidebar + topbar
│   │   ├── incidents/
│   │   │   ├── IncidentFeed.tsx     # Real-time auto-refreshing list
│   │   │   ├── IncidentRow.tsx      # Single row in the feed table
│   │   │   ├── IncidentFilters.tsx  # Filter bar (status, type, district, date)
│   │   │   ├── IncidentDetail.tsx   # Full incident detail panel
│   │   │   ├── SLATimer.tsx         # Countdown timer (red after 15 min)
│   │   │   ├── AssignModal.tsx      # Modal to assign officer
│   │   │   ├── StatusUpdateModal.tsx# Modal to update status
│   │   │   ├── ForwardModal.tsx     # Modal to forward to another agency
│   │   │   └── NotesPanel.tsx       # Officer notes + citizen chat
│   │   ├── map/
│   │   │   ├── LiveMap.tsx          # Google Maps with incident pins
│   │   │   ├── IncidentPin.tsx      # Custom map marker component
│   │   │   └── OfficerPin.tsx       # Officer location marker
│   │   ├── stats/
│   │   │   ├── StatCard.tsx         # Single KPI card (number + label)
│   │   │   ├── StatusBreakdown.tsx  # Bar chart: incidents by status
│   │   │   ├── TypeBreakdown.tsx    # Pie chart: incidents by type
│   │   │   └── TrendChart.tsx       # Line chart: incidents over time
│   │   ├── officers/
│   │   │   ├── OfficerTable.tsx     # List of officers with status
│   │   │   ├── OfficerCard.tsx      # Single officer card
│   │   │   └── DutyToggle.tsx       # Toggle on/off duty
│   │   └── shared/
│   │       ├── SeverityBadge.tsx    # Colored badge: LOW/MED/HIGH/CRIT
│   │       ├── StatusBadge.tsx      # Colored badge: incident status
│   │       ├── TypeIcon.tsx         # Icon for each incident type
│   │       ├── ConfirmDialog.tsx    # Reusable confirm dialog
│   │       └── EmptyState.tsx       # Empty list state component
│   ├── lib/
│   │   ├── apiClient.ts             # Axios instance
│   │   ├── socket.ts                # Socket.io client
│   │   └── formatters.ts            # Date, time, distance formatters
│   ├── hooks/
│   │   ├── useIncidentFeed.ts       # React Query + Socket.io for live feed
│   │   ├── useMapData.ts            # Map incident pins hook
│   │   ├── useDashboardStats.ts     # Stats hook (auto-refresh every 60s)
│   │   └── useOfficers.ts           # Officers list hook
│   └── store/
│       ├── authStore.ts             # Officer auth (Zustand)
│       └── uiStore.ts               # Sidebar open/close, selected incident
├── public/
└── .env.local
```

---

### B3. Brand & Design System

The police dashboard uses a professional dark-accented theme:

```typescript
// src/constants/theme.ts
export const PoliceTheme = {
  sidebar:        '#0D1B2A',   // Very dark navy
  sidebarActive:  '#1B3A5C',
  topbar:         '#FFFFFF',
  background:     '#F0F4F8',
  surface:        '#FFFFFF',
  border:         '#E2E8F0',
  primary:        '#1B5E82',
  primaryHover:   '#154E6E',

  // Severity colors (used for left border on incident rows)
  critical:       '#D32F2F',   // Red
  high:           '#F57C00',   // Orange
  medium:         '#1976D2',   // Blue
  low:            '#757575',   // Grey

  // Status colors
  statusReceived:   '#64748B',
  statusReview:     '#3B82F6',
  statusAssigned:   '#8B5CF6',
  statusDispatched: '#F59E0B',
  statusOnScene:    '#EF4444',
  statusResolved:   '#22C55E',
  statusClosed:     '#94A3B8',

  // SLA timer colors
  slaGreen:  '#22C55E',   // 0–5 min
  slaYellow: '#F59E0B',   // 5–10 min
  slaOrange: '#F97316',   // 10–15 min
  slaRed:    '#EF4444',   // 15+ min (BREACH)
};
```

---

### B4. Screen Specifications

Implement each screen with FULL working code:

---

#### `app/login/page.tsx` — Officer Login

Layout:
- Left half: Rwanda Safe logo + "Rwanda National Police — Officer Portal" + badge icon
- Right half: login form

Form fields:
- Phone number input (Rwandan format)
- "Send OTP" button
- OTP input (6 boxes, same as citizen app)
- On verify: calls `POST /v1/auth/verify`, saves token, checks role is not CITIZEN — if CITIZEN role, show error "This portal is for officers only"
- On success: redirect to `/dashboard`

---

#### `app/dashboard/page.tsx` — Overview Page

This is the first screen an officer sees after login. Layout:

**Top row — 5 stat cards (fetched from `GET /v1/dashboard/stats`):**

| Card | Value | Color |
|---|---|---|
| Open Cases | count | Blue |
| Critical Open | count | Red |
| Received Today | count | Purple |
| Resolved Today | count | Green |
| Avg Response Time | "X min" | Orange |

**Second row — Live Incident Feed (left 65%) + On-Duty Officers (right 35%)**

Live Incident Feed:
- Title: "Live Incidents" with a green pulsing dot indicator
- Auto-refreshes via Socket.io `incident:new` event
- Shows last 10 incidents
- Each row: severity color bar on left, type icon, tracking code, description excerpt, district, time ago, status badge, SLA timer
- "View All" button → `/dashboard/incidents`

On-Duty Officers panel:
- List of on-duty officers with avatar initial, name, rank, open case count
- Each officer has a colored dot: green = available (0 cases), yellow = busy (1-2), red = overloaded (3+)
- "Manage Officers" link

**Third row — Quick Charts**
- Left: Bar chart — incidents by type today (using Recharts)
- Right: Donut chart — incidents by status (using Recharts)

---

#### `app/dashboard/incidents/page.tsx` — Full Incident List

Layout: full-width table with filters at top.

**Filter bar** (inline, not a modal):
- Status dropdown: All / Received / Under Review / Assigned / Dispatched / On Scene / Resolved
- Type dropdown: All / Accident / Crime / Medical / Fire / GBV / etc.
- Severity dropdown: All / Critical / High / Medium / Low
- District dropdown: all Rwanda districts
- Date range: from/to date pickers
- Search: text input (searches description + tracking code)
- Reset filters button

**Incidents table columns:**
| Column | Details |
|---|---|
| Priority | Left colored border: red/orange/blue/grey by severity |
| Tracking Code | e.g. RW-2026-00421, monospace font, clickable |
| Type | Icon + label |
| Description | First 80 chars, truncated |
| Location | District + address |
| Reported | Time ago (e.g. "3 min ago") |
| Status | Colored badge |
| SLA | Countdown timer in red if breached |
| Assigned To | Officer name or "Unassigned" |
| Actions | "View" button |

- Clicking any row OR "View" → opens incident detail panel as a right-side drawer (not a new page)
- Table supports pagination (20 per page)
- When `incident:new` Socket.io event fires, a toast appears: "New incident received" with a button to refresh the list

**Incident Detail Drawer** (right side, 480px wide, slides in):

Built as `IncidentDetail.tsx` component. Contains:

**Header section:**
- Tracking code (large, bold)
- Type icon + label
- Severity badge + Status badge
- SLA Timer (large, prominently displayed)
- Close drawer button

**Info section:**
- Description (full text)
- Location: address + district + "Open in Maps" link
- Reported: date + time
- Reporter: "Anonymous" or name + phone (if not anonymous)
- Evidence: thumbnail grid of photos/videos, click to view full size

**Action buttons row:**
- "Update Status" (opens `StatusUpdateModal`)
- "Assign Officer" (opens `AssignModal`)
- "Forward to Agency" (opens `ForwardModal`)
- "Add Note" (opens inline note form)

**Notes & Chat section:**
- Toggle: "Internal Notes" / "Citizen Messages"
- Internal Notes: officer-only notes with timestamp + author name
- Citizen Messages: back-and-forth messages with citizen (real-time Socket.io)
- Text input + Send button at bottom

**Status History section:**
- Timeline: each status change with: old status → new status, officer name, timestamp, optional note

---

#### `AssignModal.tsx` — Assign Officer Modal

```
Title: "Assign Incident RW-2026-XXXXX"

Officer dropdown:
  - Shows all on-duty officers in the agency
  - Each option: "[Badge] Officer Name — X open cases"
  - Officers with 3+ cases shown with ⚠️ warning

Notes field (optional): "Any instructions for the officer?"

Buttons: Cancel | Assign
```

On confirm:
- Calls `POST /v1/incidents/:id/assign`
- Updates status to ASSIGNED
- Emits Socket.io update
- Closes modal, refreshes incident row

---

#### `StatusUpdateModal.tsx` — Status Update Modal

```
Title: "Update Status"

Current status shown as read-only badge.

New status dropdown:
  (Only shows valid next statuses — no going backwards)
  RECEIVED → UNDER_REVIEW, CANCELLED
  UNDER_REVIEW → ASSIGNED, CANCELLED
  ASSIGNED → DISPATCHED, CANCELLED
  DISPATCHED → ON_SCENE
  ON_SCENE → RESOLVED
  RESOLVED → CLOSED

Note field (optional): "Add a note about this update"

Buttons: Cancel | Update Status
```

---

#### `ForwardModal.tsx` — Forward to Agency Modal

```
Title: "Forward to Another Agency"

Agency selector (radio buttons with icons):
  🏥 Hospital / SAMU  — for medical emergencies at the scene
  🚒 Fire Brigade     — for fire or hazmat at the scene
  🔍 RIB              — for serious crimes requiring investigation

Reason field (required): "Why are you forwarding this case?"

Checkbox: "Keep this case open in Police dashboard as well"
  (if unchecked, marks police assignment as closed)

Buttons: Cancel | Forward
```

On confirm:
- Calls `POST /v1/dashboard/forward`
- Adds internal note
- Shows success toast: "Forwarded to Hospital. They have been notified."

---

#### `SLATimer.tsx` — SLA Timer Component

```typescript
/**
 * Shows a countdown of how long a case has been RECEIVED without being DISPATCHED.
 * Color changes:
 *   0–5 min:   green  (#22C55E)
 *   5–10 min:  yellow (#F59E0B)
 *   10–15 min: orange (#F97316)
 *   15+ min:   red    (#EF4444) + pulsing animation
 *
 * Props:
 *   createdAt: string (ISO date)
 *   status: IncidentStatus
 *
 * If status is DISPATCHED or beyond, show "✓ Responded in X min" in green.
 * If status is RESOLVED or CLOSED, hide the timer entirely.
 */
export function SLATimer({ createdAt, status }: SLATimerProps) {
  // Uses setInterval to update every second
  // Calculates elapsed minutes from createdAt to now
  // Apply color + pulse animation based on elapsed time
}
```

---

#### `app/dashboard/map/page.tsx` — Live Incident Map

Full-screen Google Maps. Implement using `@googlemaps/js-api-loader`.

**Incident Pins:**
- Each active incident shown as a colored circle pin
- Color by severity: red (CRITICAL), orange (HIGH), blue (MEDIUM), grey (LOW)
- Pin size: 24px circle with incident type icon inside
- Click pin → opens a popup with: tracking code, type, status, description excerpt, "Open Case" button

**Officer Pins:**
- On-duty officers shown as blue badge icons with their initials
- Only shown if officer has shared their location (PATCH /v1/officers/:id/location)
- Click → shows officer name, rank, current assignment

**Map controls (top-right panel):**
- Layer toggles (checkboxes):
  - ✅ Show all incidents
  - ✅ Show on-duty officers
  - ☐ Show police stations
  - ☐ Show hospitals
  - ☐ Show fire stations
- Filter by severity (checkboxes): Critical / High / Medium / Low
- Legend panel (collapsible)

**Auto-refresh:**
- Map pins refresh every 30 seconds
- New incidents added in real-time via Socket.io `incident:new` event
- New incident pin added to map immediately without page reload

**Heat Map toggle:**
- Toggle button: "Heat Map" → switches from pins to a density heat map showing incident concentration areas

---

#### `app/dashboard/officers/page.tsx` — Officer Management

Two sections:

**Active Duty Panel:**
- Cards grid showing all on-duty officers
- Each card: avatar (initials), name, badge, rank, current assignment (or "Available"), open case count, "Off Duty" button
- Green dot = available, yellow = busy, red = overloaded

**All Officers Table:**
- Full table of all officers in the agency
- Columns: Name, Badge, Rank, Status (On Duty / Off Duty), Open Cases, Last Seen
- Actions: View Cases, Toggle Duty
- Search by name or badge number

---

#### `app/dashboard/analytics/page.tsx` — Analytics Page

All data from `GET /v1/dashboard/stats`. Use Recharts for all charts.

**Date range picker at top:** Today / This Week / This Month / Custom Range

**Row 1 — KPI Cards (same 5 as overview page but for selected range)**

**Row 2 — Charts:**

Left (60%): **Incident Trend Line Chart**
- X-axis: days/hours depending on range
- Y-axis: number of incidents
- Multiple lines: Total / Critical / Resolved

Right (40%): **Incident Type Pie Chart**
- Each incident type as a slice
- Click slice to filter the table below

**Row 3 — District Bar Chart (full width)**
- Top 10 districts by incident count
- Horizontal bar chart
- Color by most common severity in that district

**Row 4 — Response Time Analysis**
- Average response time by district (bar chart)
- SLA breach rate: % of cases that waited more than 15 minutes before dispatch

**Row 5 — Data Table**
- Filterable table of all incidents in the selected range
- Exportable to CSV (button: "Export CSV")

---

#### `app/dashboard/handover/page.tsx` — Shift Handover

**Current Shift Summary:**
- List of all open cases currently assigned to the logged-in officer
- Each case: tracking code, type, status, priority, description excerpt
- Total count: "You have X open cases"

**Handover Notes Form:**
```
Textarea: "Summary for incoming officer"
Placeholder: "Describe any ongoing situations, key cases to watch, etc."

Submit button: "Complete Handover & Go Off Duty"
```

On submit:
- Calls `POST /v1/dashboard/handover` with summary + open case IDs
- Calls `PATCH /v1/officers/:id/duty` to set isOnDuty = false
- Shows success: "Handover complete. You are now off duty."
- Redirects to login page

**Previous Handovers:**
- Accordion list of the last 5 handover logs
- Each entry: date, officer who handed over, summary, number of open cases

---

### B5. Real-time Feed Hook

Create `apps/dashboard-police/src/hooks/useIncidentFeed.ts`:

```typescript
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import { apiClient } from '../lib/apiClient';

/**
 * Manages the live incident feed for the dashboard.
 *
 * Behavior:
 * 1. Initial load: fetches incidents from GET /v1/dashboard/incidents
 * 2. Subscribes to Socket.io "incident:new" event
 * 3. On new incident: prepends to list + shows toast notification
 * 4. On "incident:updated": updates the matching incident in the list in-place
 * 5. Supports pagination: calling loadMore() fetches next page and appends
 * 6. Supports filters: changing any filter resets to page 1
 *
 * Returns:
 *   incidents, isLoading, error, filters, setFilters, loadMore, hasMore, newCount
 */
export function useIncidentFeed(agencyType: string) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [newCount, setNewCount] = useState(0);

  // React Query for initial + paginated load

  useEffect(() => {
    const socket = getSocket();

    socket.on('incident:new', (incident) => {
      // Prepend to list + increment newCount
      setNewCount(c => c + 1);
      queryClient.setQueryData(['incidents', agencyType, filters], (old: any) => ({
        ...old,
        data: [incident, ...(old?.data ?? [])],
      }));
    });

    socket.on('incident:updated', (update) => {
      // Update matching incident in list
      queryClient.setQueryData(['incidents', agencyType, filters], (old: any) => ({
        ...old,
        data: (old?.data ?? []).map((inc: any) =>
          inc.id === update.id ? { ...inc, ...update } : inc
        ),
      }));
    });

    return () => {
      socket.off('incident:new');
      socket.off('incident:updated');
    };
  }, [agencyType, filters, queryClient]);

  return { filters, setFilters, newCount };
}
```

---

### B6. Socket.io Client for Dashboard

Create `apps/dashboard-police/src/lib/socket.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') ?? 'http://localhost:4000', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('[Police Dashboard] Socket connected'));
  socket.on('disconnect', (reason) => console.warn('[Police Dashboard] Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('[Police Dashboard] Socket error:', err.message));

  return socket;
}

export function getSocket(): Socket {
  if (!socket) throw new Error('Socket not initialized. Call connectSocket first.');
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
```

The socket must be initialized in the dashboard layout after login:
```typescript
// app/dashboard/layout.tsx
// After confirming auth, call: connectSocket(accessToken)
```

---

### B7. API Client for Dashboard

Create `apps/dashboard-police/src/lib/apiClient.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('police_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('police_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### B8. Environment Variables

Create `apps/dashboard-police/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
NEXT_PUBLIC_APP_NAME=Rwanda Safe — Police Dashboard
NEXT_PUBLIC_AGENCY_TYPE=POLICE
```

---

## Part C — Backend Tests for Chapter 3

Create `apps/api/src/modules/dashboard/dashboard.test.ts` with these tests:

1. `GET /v1/dashboard/incidents` — returns only POLICE-routed incidents for police officer
2. `GET /v1/dashboard/incidents` — citizen role returns 403
3. `GET /v1/dashboard/stats` — returns correct count of open cases
4. `GET /v1/dashboard/map` — returns lat/lng for all active incidents
5. `POST /v1/dashboard/forward` — creates ForwardLog, creates Assignment for target agency
6. `POST /v1/dashboard/forward` — emits `incident:new` to target agency Socket.io room
7. `POST /v1/dashboard/handover` — creates ShiftHandover record with open case IDs
8. `PATCH /v1/officers/:id/duty` — toggles officer isOnDuty field
9. `GET /v1/dashboard/officers` — returns only on-duty officers for caller's agency
10. Status flow validation: cannot set status backwards (e.g. DISPATCHED → RECEIVED returns 400)

---

## Definition of Done for Chapter 3

**Backend**
- [ ] `GET /v1/dashboard/incidents` returns incidents filtered to POLICE agency only
- [ ] Incident routing: ACCIDENT type appears in police dashboard feed
- [ ] Incident routing: MEDICAL_EMERGENCY type does NOT appear in police dashboard feed
- [ ] `POST /v1/dashboard/forward` creates ForwardLog and notifies target agency via Socket.io
- [ ] `POST /v1/dashboard/handover` saves handover summary and sets officer off-duty
- [ ] All 10 dashboard tests pass
- [ ] `npx prisma migrate dev` runs cleanly with new ShiftHandover and ForwardLog tables

**Police Dashboard App**
- [ ] Officer can log in with phone + OTP (CITIZEN role rejected)
- [ ] Overview page loads with 5 stat cards populated from API
- [ ] Live feed shows new incidents within 2 seconds of submission (Socket.io)
- [ ] SLA timer is green for new cases and turns red after 15 minutes
- [ ] Clicking an incident row opens the detail drawer
- [ ] "Assign Officer" modal shows on-duty officers and assigns the case
- [ ] "Update Status" modal only shows valid next statuses
- [ ] "Forward to Agency" modal creates a ForwardLog and shows success toast
- [ ] Map page shows incident pins colored by severity
- [ ] Clicking a map pin opens an info popup with "Open Case" button
- [ ] Heat map toggle works
- [ ] Analytics page renders all 5 chart sections
- [ ] "Export CSV" downloads a CSV of incidents in the selected date range
- [ ] Handover page shows officer's open cases and submits handover log

**Integration (End-to-End)**
- [ ] Citizen submits a CRIME report on mobile app
- [ ] Police dashboard receives it on the live feed within 2 seconds
- [ ] Officer assigns the case to themselves
- [ ] Citizen's mobile app shows status changed to "Assigned" via push notification
- [ ] Officer adds a non-internal note; citizen sees it in their chat

---

## Notes for Developer

- The police dashboard runs on port **3001** (`npm run dev -- --port 3001`)
- The agency type `POLICE` is hardcoded via the env var `NEXT_PUBLIC_AGENCY_TYPE=POLICE`. The hospital and other dashboards will use the same codebase with a different env var in Chapter 4.
- For the Google Maps heat map, use the `@googlemaps/js-api-loader` with the `visualization` library: `loader.load({ libraries: ['visualization'] })`.
- The CSV export can be done client-side using a simple utility function — no backend endpoint needed. Convert the incidents array to CSV string and trigger a download.
- Do NOT use `localStorage` for auth tokens in production builds — use httpOnly cookies. For now, localStorage is acceptable for development. Add a TODO comment.
- The `NEXT_PUBLIC_AGENCY_TYPE` env var will be used by the dashboard layout to scope all API calls. Pass it as a query parameter: `GET /v1/dashboard/incidents?agencyType=POLICE`.
- Refer to Rwanda Safe SSD v1.0, Chapter 5 for the full Police Dashboard feature specification.

---

*End of Chapter 3 Developer Prompt — Rwanda Safe v1.0*
