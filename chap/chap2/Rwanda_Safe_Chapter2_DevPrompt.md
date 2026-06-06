# Rwanda Safe — Full Developer Prompt: Chapter 2 (Citizen App & Incident Reporting)

> **Document Reference:** Rwanda Safe SSD v1.0, Chapter 4  
> **Depends on:** Chapter 1 completed and all Definition of Done items checked  
> **Purpose:** Build the complete citizen-facing experience — the mobile app (React Native/Expo) and web portal (Next.js) — including incident submission, SOS button, GPS capture, media upload, incident tracking, and the resource map.

---

## What This Chapter Builds

By the end of Chapter 2 your developer will have:

1. Full incident reporting API (backend) — all endpoints, validation, routing logic
2. Media upload to Cloudinary (photos, video, voice)
3. Citizen mobile app screens (React Native/Expo) — all core screens
4. Citizen web portal (Next.js) — all core pages
5. Real-time incident status push notifications (FCM)
6. Offline mode with sync queue (mobile)
7. Multi-language support (Kinyarwanda, English, French)
8. Full test coverage for the incident API

---

## Part A — Backend: Incident Reporting API

### A1. New Files to Create

Add these files inside `apps/api/src/modules/`:

```
modules/
├── incidents/
│   ├── incidents.router.ts
│   ├── incidents.controller.ts
│   ├── incidents.service.ts
│   ├── incidents.schema.ts
│   └── incidents.test.ts
├── media/
│   ├── media.router.ts
│   ├── media.controller.ts
│   └── media.service.ts
└── notifications/
    ├── notifications.service.ts
    └── fcm.service.ts
```

Also add to `apps/api/src/utils/`:
```
utils/
├── incidentRouter.ts     # Logic to determine target agency from incident type
└── distanceCalc.ts       # Haversine formula for nearest agency/resource
```

---

### A2. Incident Routing Logic

Create `apps/api/src/utils/incidentRouter.ts`:

```typescript
import { IncidentType, AgencyType } from '@prisma/client';

/**
 * Automatically determines which authority dashboard receives the incident.
 * Some types go to multiple agencies (e.g. accident with injuries → Police + Hospital).
 */
export function routeIncident(type: IncidentType): AgencyType[] {
  const routing: Record<IncidentType, AgencyType[]> = {
    ACCIDENT:           [AgencyType.POLICE, AgencyType.HOSPITAL],
    MEDICAL_EMERGENCY:  [AgencyType.HOSPITAL],
    CRIME:              [AgencyType.POLICE],
    FIRE:               [AgencyType.FIRE, AgencyType.POLICE],
    GBV:                [AgencyType.POLICE, AgencyType.RIB],
    CORRUPTION:         [AgencyType.RIB],
    MISSING_PERSON:     [AgencyType.POLICE, AgencyType.RIB],
    NATURAL_DISASTER:   [AgencyType.FIRE, AgencyType.HOSPITAL, AgencyType.POLICE],
    OTHER:              [AgencyType.POLICE],
  };
  return routing[type] ?? [AgencyType.POLICE];
}
```

---

### A3. Incidents Schema (Zod Validation)

Create `apps/api/src/modules/incidents/incidents.schema.ts`:

```typescript
import { z } from 'zod';
import { IncidentType, IncidentSeverity } from '@prisma/client';

export const createIncidentSchema = z.object({
  body: z.object({
    type: z.nativeEnum(IncidentType),
    severity: z.nativeEnum(IncidentSeverity).default('MEDIUM'),
    title: z.string().max(200).optional(),
    description: z.string().min(10, 'Please describe the incident in at least 10 characters').max(2000),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().max(500).optional(),
    district: z.string().max(100).optional(),
    isAnonymous: z.boolean().default(false),
    witnessName: z.string().max(100).optional(),
    witnessPhone: z.string().optional(),
  }),
});

export const updateIncidentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['UNDER_REVIEW', 'ASSIGNED', 'DISPATCHED', 'ON_SCENE', 'RESOLVED', 'CLOSED', 'CANCELLED']),
    note: z.string().max(500).optional(),
  }),
});

export const addNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    note: z.string().min(1).max(2000),
    isInternal: z.boolean().default(false),
  }),
});

export const listIncidentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().max(100).default(20),
    status: z.string().optional(),
    type: z.string().optional(),
    severity: z.string().optional(),
    district: z.string().optional(),
    agencyType: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const assignIncidentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    officerId: z.string().uuid().optional(),
    agencyId: z.string().uuid(),
    notes: z.string().optional(),
  }),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>['body'];
export type UpdateStatusInput = z.infer<typeof updateIncidentStatusSchema>['body'];
```

---

### A4. Incidents Service

Create `apps/api/src/modules/incidents/incidents.service.ts` implementing the following functions. Write the FULL implementation for each:

```typescript
import { prisma } from '../../config/database';
import { generateTrackingCode } from '../../utils/generateTrackingCode';
import { routeIncident } from '../../utils/incidentRouter';
import { notificationsService } from '../notifications/notifications.service';
import { CreateIncidentInput, UpdateStatusInput } from './incidents.schema';
import { IncidentStatus, AgencyType } from '@prisma/client';

export const incidentsService = {

  /**
   * Creates a new incident:
   * 1. Generate tracking code
   * 2. Determine target agencies using routeIncident()
   * 3. Save to DB
   * 4. Emit Socket.io event "incident:new" to relevant agency rooms
   * 5. Send push notification to citizen confirming receipt
   * 6. Return full incident with tracking code
   */
  async createIncident(data: CreateIncidentInput, reporterId: string | null): Promise<Incident>,

  /**
   * Returns a single incident by ID.
   * Citizens can only see their own incidents.
   * Officers can see all incidents routed to their agency.
   * Admin can see all.
   */
  async getIncidentById(id: string, requesterId: string, requesterRole: string): Promise<Incident>,

  /**
   * Returns incident by tracking code (public lookup, no auth required).
   * Returns: trackingCode, status, statusHistory, createdAt only.
   * Does NOT return reporter info.
   */
  async getIncidentByTrackingCode(trackingCode: string): Promise<IncidentPublicView>,

  /**
   * Returns paginated list of incidents.
   * Filters: status, type, severity, district, agencyType, date range, search.
   * For officers: only incidents routed to their agency.
   * For citizens: only their own incidents.
   * For admin: all incidents.
   */
  async listIncidents(filters: any, requesterId: string, requesterRole: string): Promise<PaginatedIncidents>,

  /**
   * Updates the status of an incident.
   * Creates a StatusHistory record.
   * Emits Socket.io "incident:updated" event.
   * Sends push notification to citizen with new status.
   */
  async updateStatus(incidentId: string, data: UpdateStatusInput, updatedById: string): Promise<Incident>,

  /**
   * Assigns an incident to an officer and/or agency.
   * Creates an Assignment record.
   * Changes status to ASSIGNED.
   * Emits "incident:updated" event.
   */
  async assignIncident(incidentId: string, data: any, assignedById: string): Promise<Assignment>,

  /**
   * Adds a note or message to an incident.
   * isInternal: true = visible to officers only
   * isInternal: false = visible to both officer and citizen
   * Emits "message:new" Socket.io event.
   * If not internal, sends push notification to citizen.
   */
  async addNote(incidentId: string, authorId: string, note: string, isInternal: boolean): Promise<CaseNote>,

  /**
   * Citizen cancels their own report (only if status is RECEIVED or UNDER_REVIEW).
   * Sets status to CANCELLED.
   */
  async cancelIncident(incidentId: string, reporterId: string): Promise<Incident>,

  /**
   * Returns the full status timeline for an incident (for tracking screen).
   */
  async getStatusHistory(incidentId: string): Promise<StatusHistory[]>,
};
```

---

### A5. Media Upload Service

Create `apps/api/src/modules/media/media.service.ts`:

```typescript
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { MediaType } from '@prisma/client';

// Configure Cloudinary on import
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const mediaService = {

  /**
   * Uploads a file buffer to Cloudinary under the folder:
   * rwanda-safe/incidents/{incidentId}/
   *
   * Rules:
   * - Max 5 files per incident (check before uploading)
   * - Allowed types: image/jpeg, image/png, image/webp, video/mp4, audio/mpeg, audio/webm
   * - Max file size: 20MB (enforced at multer middleware level)
   * - Returns: { url, publicId, type, sizeBytes }
   */
  async uploadMedia(
    incidentId: string,
    file: Express.Multer.File,
    uploadedById: string
  ): Promise<IncidentMedia>,

  /**
   * Deletes a media file from Cloudinary and removes the DB record.
   * Only the uploader or an admin can delete.
   */
  async deleteMedia(mediaId: string, requesterId: string): Promise<void>,

  /**
   * Returns all media for an incident.
   */
  async getIncidentMedia(incidentId: string): Promise<IncidentMedia[]>,
};
```

Also create `apps/api/src/modules/media/media.router.ts` with:
- `POST /v1/incidents/:id/media` — upload file (multipart/form-data, field name: `file`)
- `GET /v1/incidents/:id/media` — list media for an incident
- `DELETE /v1/media/:mediaId` — delete a media file

Use `multer` with `memoryStorage()` (store in RAM before uploading to Cloudinary).

---

### A6. Notifications Service

Create `apps/api/src/modules/notifications/notifications.service.ts`:

```typescript
/**
 * Sends push notifications to citizens via Firebase Cloud Messaging.
 * Falls back to SMS via Africa's Talking if FCM token is not available.
 */
export const notificationsService = {

  /**
   * Notify citizen that their report was received.
   * Message: "Your report RW-2026-XXXXX has been received. We will respond shortly."
   */
  async notifyReportReceived(userId: string, trackingCode: string): Promise<void>,

  /**
   * Notify citizen of status change.
   * Message: "Update on RW-2026-XXXXX: Your report is now [STATUS]."
   */
  async notifyStatusChange(userId: string, trackingCode: string, newStatus: string): Promise<void>,

  /**
   * Notify citizen of a new message from the officer.
   * Message: "New message on your report RW-2026-XXXXX. Open the app to read."
   */
  async notifyNewMessage(userId: string, trackingCode: string): Promise<void>,

  /**
   * Send broadcast alert to all users in a district (or all users if district is null).
   * Uses FCM topic messaging: topic = "district_{districtName}" or "all_users"
   */
  async broadcastAlert(title: string, message: string, district: string | null): Promise<void>,
};
```

---

### A7. Incidents Router

Create `apps/api/src/modules/incidents/incidents.router.ts` with ALL these endpoints:

```
POST   /v1/incidents                        Create new incident (auth: citizen or anonymous)
GET    /v1/incidents                        List incidents (auth: citizen sees own; officer sees agency's)
GET    /v1/incidents/:id                    Get incident by ID
GET    /v1/incidents/track/:trackingCode    Public tracking (no auth)
PATCH  /v1/incidents/:id/status            Update status (auth: officer only)
POST   /v1/incidents/:id/assign            Assign to officer (auth: officer only)
POST   /v1/incidents/:id/notes             Add note/message
GET    /v1/incidents/:id/notes             Get notes (internal notes filtered by role)
GET    /v1/incidents/:id/history           Get status history
POST   /v1/incidents/:id/cancel            Citizen cancels their own report
POST   /v1/incidents/:id/feedback          Submit post-resolution rating (1-5)
```

Register this router in `apps/api/src/app.ts`:
```typescript
import { incidentsRouter } from './modules/incidents/incidents.router';
app.use('/v1/incidents', incidentsRouter);
```

---

### A8. API Tests

Create `apps/api/src/modules/incidents/incidents.test.ts` using Jest + Supertest. Write tests for:

1. `POST /v1/incidents` — creates incident, returns tracking code
2. `POST /v1/incidents` — anonymous report (no auth header) succeeds
3. `GET /v1/incidents/track/:code` — returns public status without auth
4. `POST /v1/incidents` — fails with missing required fields (400 validation error)
5. `POST /v1/incidents` — fails with invalid GPS coordinates
6. `PATCH /v1/incidents/:id/status` — citizen cannot update status (403)
7. `POST /v1/incidents/:id/notes` — adds a note, returns it
8. Media upload: mock Cloudinary, test `POST /v1/incidents/:id/media`

---

## Part B — Citizen Mobile App (React Native + Expo)

### B1. Setup

Inside `apps/mobile/` run:
```bash
npx create-expo-app@latest . --template blank-typescript
npx expo install expo-router expo-location expo-image-picker expo-av expo-file-system expo-sqlite expo-notifications @react-native-async-storage/async-storage
npm install @tanstack/react-query axios zustand react-native-maps @gorhom/bottom-sheet react-native-reanimated react-native-safe-area-context
```

### B2. Folder Structure

```
apps/mobile/
├── app/
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Splash/redirect screen
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx          # Welcome + language select screen
│   │   ├── phone.tsx            # Phone number entry
│   │   └── verify.tsx           # OTP verification
│   └── (app)/
│       ├── _layout.tsx          # Tab navigator
│       ├── home.tsx             # Home screen with SOS button
│       ├── report.tsx           # Report new incident (full form)
│       ├── my-reports.tsx       # List of user's past reports
│       ├── report/
│       │   └── [id].tsx         # Incident detail + tracking + chat
│       ├── map.tsx              # Nearest services map
│       └── settings.tsx         # Language, notifications, account
├── src/
│   ├── api/
│   │   ├── client.ts            # Axios instance with base URL + auth header
│   │   ├── incidents.ts         # API calls for incidents
│   │   ├── auth.ts              # API calls for auth
│   │   └── alerts.ts            # API calls for alerts
│   ├── store/
│   │   ├── authStore.ts         # Zustand: user, tokens, login/logout
│   │   ├── incidentStore.ts     # Zustand: draft incident, offline queue
│   │   └── settingsStore.ts     # Zustand: language preference
│   ├── i18n/
│   │   ├── index.ts             # i18n setup
│   │   └── locales/
│   │       ├── en.json          # English strings
│   │       ├── rw.json          # Kinyarwanda strings
│   │       └── fr.json          # French strings
│   ├── hooks/
│   │   ├── useLocation.ts       # Expo Location hook
│   │   ├── useIncidents.ts      # React Query hooks for incidents
│   │   └── useOfflineQueue.ts   # Offline sync queue hook
│   ├── components/
│   │   ├── SOSButton.tsx        # Large red SOS button component
│   │   ├── IncidentCard.tsx     # Card for incident list
│   │   ├── StatusBadge.tsx      # Colored status badge
│   │   ├── MediaPicker.tsx      # Photo/video/audio picker
│   │   ├── MapView.tsx          # Map with markers
│   │   └── OfflineBanner.tsx    # "You are offline" banner
│   └── constants/
│       ├── colors.ts            # Rwanda Safe brand colors
│       └── incidentTypes.ts     # Incident type labels + icons
└── assets/
    └── icons/                   # App icons, splash screen
```

---

### B3. Screen Specifications

Implement each screen with FULL working code:

#### `app/(auth)/welcome.tsx` — Welcome Screen
- Rwanda Safe logo centered
- Tagline in current language
- 3 language buttons: English, Kinyarwanda (Ikinyarwanda), French
- "Get Started" button → navigates to `phone.tsx`
- "Continue as Guest" button → navigates directly to `(app)/home` with anonymous mode

#### `app/(auth)/phone.tsx` — Phone Number Entry
- Input field with `+250` prefix for Rwanda
- Validate format: `+2507[2389]XXXXXXX`
- "Send OTP" button → calls `POST /v1/auth/register`
- Show loading spinner during API call
- On success → navigate to `verify.tsx` passing the phone number

#### `app/(auth)/verify.tsx` — OTP Verification
- Display: "Enter the 6-digit code sent to {phone}"
- 6-box OTP input (each digit in its own box, auto-advance on input)
- Resend OTP button (disabled for 60 seconds after send)
- On verify → calls `POST /v1/auth/verify` → saves tokens to Zustand store + AsyncStorage → navigate to `(app)/home`
- Show error message if OTP is wrong

#### `app/(app)/home.tsx` — Home Screen
- Header: "Rwanda Safe" logo + notification bell icon
- Large red **SOS Button** (center of screen, circular, 120px)
  - On tap: show bottom sheet with 4 choices: Police, Medical, Fire, Other
  - On choice: create incident immediately with current GPS location + chosen type, navigate to report detail
- Below SOS: 4 quick action cards in a 2x2 grid:
  - Report Accident, Report Crime, Medical Emergency, Fire/Hazard
  - Each card has an icon and label
  - On tap: open `report.tsx` with that type pre-selected
- Active government alerts shown as dismissible banner at top (fetched from `GET /v1/alerts/active`)
- Bottom tab bar: Home, My Reports, Map, Settings

#### `app/(app)/report.tsx` — Full Incident Report Form
This is the most important screen. Build it as a multi-step form with 3 steps:

**Step 1 — What happened?**
- Incident type selector (grid of icons): Accident, Crime, Medical, Fire, GBV, Corruption, Missing Person, Natural Disaster, Other
- Severity selector: Low / Medium / High / Critical (colored buttons)
- Description text area (min 10 chars)
- Anonymous toggle with explanation: "Your identity will be hidden from responders"
- "Next" button

**Step 2 — Where?**
- Map view with draggable pin showing current GPS location
- "Use my location" button (auto-fills GPS)
- Address text field (optional, for extra context)
- District dropdown (list of all Rwanda districts)
- "Next" button

**Step 3 — Evidence (optional)**
- Photo picker: up to 5 photos from camera or gallery
- Video: 1 short video (max 30 seconds)
- Voice note: tap to record, tap to stop (max 60 seconds)
- Thumbnails of selected media shown in a horizontal scroll
- "Submit Report" button

On submit:
1. Call `POST /v1/incidents` with form data
2. If media selected: call `POST /v1/incidents/:id/media` for each file
3. Show success screen with tracking code
4. Navigate to `report/[id].tsx`

**Offline behavior:** If no internet, save the full report to SQLite (`expo-sqlite`) and show "Report saved. Will be sent when you're back online." The `useOfflineQueue` hook checks for queued reports every 30 seconds and retries when connected.

#### `app/(app)/my-reports.tsx` — My Reports
- Pull-to-refresh list of all user's past reports
- Each report shown as `IncidentCard` component showing: type icon, tracking code, status badge (color-coded), time ago, district
- Tap on card → navigate to `report/[id].tsx`
- Empty state: "No reports yet. Stay safe!"

#### `app/(app)/report/[id].tsx` — Incident Detail & Tracking
- Tracking code displayed prominently at top
- Status progress bar: Received → Under Review → Assigned → Dispatched → On Scene → Resolved
- Timeline section: list of status history entries with timestamps
- Photos/media uploaded with the report (thumbnails)
- **Chat section:** conversation between citizen and officer (non-internal notes only)
  - Text input at bottom
  - Citizen messages right-aligned, officer messages left-aligned
  - Real-time via Socket.io
- Cancel button (only shown if status is RECEIVED or UNDER_REVIEW)

#### `app/(app)/map.tsx` — Resource Map
- Full-screen Google Maps view
- User's current location shown as blue dot
- Markers for nearest: Police Stations (blue), Hospitals (red cross), Fire Stations (orange)
- Tap marker to see name, phone, estimated distance
- "Call" button on each marker opens phone dialer
- Emergency numbers strip at top: Police 112 | Ambulance 912 | Fire 111

#### `app/(app)/settings.tsx` — Settings
- Language selector: English / Kinyarwanda / French (saves to `settingsStore`)
- Notification preferences toggle
- "My Account" section: name, phone number, verify NIDA ID (optional)
- "About Rwanda Safe" section: version, privacy policy link
- Logout button

---

### B4. API Client

Create `apps/mobile/src/api/client.ts`:

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          useAuthStore.getState().setAccessToken(data.data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return axios(error.config);
        } catch {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  }
);
```

---

### B5. Zustand Stores

#### `src/store/authStore.ts`
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  phone: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  setAnonymous: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAnonymous: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, isAnonymous: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setAnonymous: () => set({ isAnonymous: true, isAuthenticated: false }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

#### `src/store/incidentStore.ts`
```typescript
import { create } from 'zustand';
import { IncidentType, IncidentSeverity } from '@rwanda-safe/shared-types';

interface DraftIncident {
  type?: IncidentType;
  severity: IncidentSeverity;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  district?: string;
  isAnonymous: boolean;
  mediaUris: string[];
}

interface OfflineQueueItem {
  id: string;               // local UUID
  draft: DraftIncident;
  mediaFiles: any[];
  createdAt: string;
  retryCount: number;
}

interface IncidentStore {
  draft: DraftIncident;
  offlineQueue: OfflineQueueItem[];
  updateDraft: (fields: Partial<DraftIncident>) => void;
  resetDraft: () => void;
  addToQueue: (draft: DraftIncident, mediaFiles: any[]) => void;
  removeFromQueue: (localId: string) => void;
  incrementRetry: (localId: string) => void;
}

// Implement using zustand with AsyncStorage persistence
```

---

### B6. i18n Translations

Create `src/i18n/locales/en.json`:
```json
{
  "app_name": "Rwanda Safe",
  "tagline": "Your safety is our priority",
  "sos": "SOS",
  "report_incident": "Report Incident",
  "my_reports": "My Reports",
  "map": "Map",
  "settings": "Settings",
  "what_happened": "What happened?",
  "where": "Where?",
  "evidence": "Evidence",
  "select_type": "Select incident type",
  "describe": "Describe what happened",
  "describe_placeholder": "Please provide as much detail as possible...",
  "anonymous_toggle": "Report anonymously",
  "anonymous_explanation": "Your identity will be hidden from responders",
  "use_my_location": "Use my location",
  "add_photos": "Add Photos",
  "record_voice": "Record Voice Note",
  "submit_report": "Submit Report",
  "report_submitted": "Report Submitted",
  "tracking_code": "Tracking Code",
  "saved_offline": "Report saved. Will be sent when you're back online.",
  "status_received": "Received",
  "status_under_review": "Under Review",
  "status_assigned": "Assigned",
  "status_dispatched": "Dispatched",
  "status_on_scene": "On Scene",
  "status_resolved": "Resolved",
  "status_closed": "Closed",
  "cancel_report": "Cancel Report",
  "type_accident": "Accident",
  "type_medical": "Medical Emergency",
  "type_crime": "Crime",
  "type_fire": "Fire",
  "type_gbv": "GBV",
  "type_corruption": "Corruption",
  "type_missing": "Missing Person",
  "type_disaster": "Natural Disaster",
  "type_other": "Other",
  "nearest_police": "Nearest Police Station",
  "nearest_hospital": "Nearest Hospital",
  "nearest_fire": "Nearest Fire Station",
  "call": "Call",
  "language": "Language",
  "notifications": "Notifications",
  "account": "My Account",
  "logout": "Log Out",
  "no_reports": "No reports yet. Stay safe!",
  "offline": "You are offline",
  "phone_invalid": "Please enter a valid Rwandan phone number",
  "otp_sent": "Verification code sent",
  "otp_wrong": "Invalid code. Please try again.",
  "resend_otp": "Resend code",
  "continue_as_guest": "Continue as Guest",
  "get_started": "Get Started",
  "emergency_police": "Police: 112",
  "emergency_ambulance": "Ambulance: 912",
  "emergency_fire": "Fire: 111"
}
```

Create `src/i18n/locales/rw.json` with the same keys translated to Kinyarwanda.
Create `src/i18n/locales/fr.json` with the same keys translated to French.

Use `i18n-js` or `expo-localization` for the i18n setup.

---

### B7. Brand Colors

Create `src/constants/colors.ts`:
```typescript
export const Colors = {
  // Primary brand
  primary:       '#1B5E82',   // Deep Rwanda blue
  primaryLight:  '#2E75B6',
  primaryDark:   '#0D3B5E',

  // Emergency red (SOS button)
  emergency:     '#D32F2F',
  emergencyLight:'#EF5350',

  // Status colors
  statusReceived:   '#757575',
  statusReview:     '#1976D2',
  statusAssigned:   '#7B1FA2',
  statusDispatched: '#F57C00',
  statusOnScene:    '#E64A19',
  statusResolved:   '#388E3C',
  statusClosed:     '#455A64',
  statusCancelled:  '#9E9E9E',

  // Incident type colors
  accident:      '#FF6F00',
  medical:       '#C62828',
  crime:         '#283593',
  fire:          '#BF360C',
  gbv:           '#880E4F',
  corruption:    '#4A148C',
  missing:       '#006064',
  disaster:      '#37474F',

  // UI
  background:    '#F5F9FC',
  surface:       '#FFFFFF',
  border:        '#E0E0E0',
  textPrimary:   '#1A1A2E',
  textSecondary: '#666666',
  textMuted:     '#999999',
  success:       '#2E7D32',
  warning:       '#F57F17',
  error:         '#C62828',
  offline:       '#E65100',
};
```

---

## Part C — Citizen Web Portal (Next.js)

### C1. Setup

Inside `apps/web-citizen/` run:
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install @tanstack/react-query axios zustand react-hook-form zod @hookform/resolvers
npm install leaflet react-leaflet @types/leaflet
npm install next-i18next react-i18next i18next
```

### C2. Folder Structure

```
apps/web-citizen/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Home/landing page
│   │   ├── report/
│   │   │   └── page.tsx              # Report form (same 3 steps as mobile)
│   │   ├── track/
│   │   │   └── page.tsx              # Public tracking page (no auth)
│   │   ├── track/[code]/
│   │   │   └── page.tsx              # Tracking detail by code
│   │   ├── my-reports/
│   │   │   └── page.tsx              # User's reports (auth required)
│   │   ├── my-reports/[id]/
│   │   │   └── page.tsx              # Report detail + chat
│   │   └── map/
│   │       └── page.tsx              # Nearest services map
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SOSButton.tsx
│   │   ├── ReportForm/
│   │   │   ├── Step1Type.tsx
│   │   │   ├── Step2Location.tsx
│   │   │   └── Step3Evidence.tsx
│   │   ├── IncidentCard.tsx
│   │   ├── StatusTimeline.tsx
│   │   ├── ChatBox.tsx
│   │   └── MapView.tsx
│   ├── lib/
│   │   ├── apiClient.ts
│   │   ├── auth.ts
│   │   └── socket.ts                 # Socket.io client
│   └── store/
│       ├── authStore.ts              # Zustand auth store (web)
│       └── reportStore.ts
└── public/
    └── locales/                      # i18n JSON files
```

### C3. Pages to Implement

#### Landing Page (`app/page.tsx`)
- Hero section: "Report emergencies fast. Help arrives faster."
- Large SOS button (navigates to `/report`)
- 4 quick report type cards
- Active alerts banner
- "Track your report" input box (enter tracking code → redirect to `/track/[code]`)
- Header with language switcher and login button
- Footer with emergency numbers: 112 | 912 | 111

#### Report Page (`app/report/page.tsx`)
- Same 3-step form as mobile (adapts to desktop layout)
- Uses `react-hook-form` + `zod` for validation
- Location step uses Leaflet map with click-to-place pin
- Evidence step uses file drag-and-drop
- On submit: same API flow as mobile

#### Public Tracking Page (`app/track/[code]/page.tsx`)
- No authentication required
- Enter tracking code or read from URL param
- Shows: status badge, status progress bar, timeline of updates
- Does NOT show reporter identity or internal notes
- "Sign in to view full details and chat" prompt

#### My Reports Page (auth required)
- Table/list of all user's reports
- Columns: Tracking Code, Type, Status, Date, District, Actions
- Click row → goes to report detail

#### Report Detail Page (auth required)
- Same layout as mobile detail screen
- Status timeline on left, chat on right (two-column desktop layout)
- Real-time chat via Socket.io client

---

## Part D — Offline Sync (Mobile)

### D1. SQLite Schema for Offline Queue

Create `apps/mobile/src/db/offlineDb.ts` using `expo-sqlite`:

```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('rwanda_safe_offline.db');

export function initOfflineDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      media_paths TEXT,
      created_at TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0,
      last_error TEXT
    );
  `);
}

export function queueIncident(id: string, payload: object, mediaPaths: string[]) {
  db.runSync(
    `INSERT INTO offline_queue (id, payload, media_paths, created_at) VALUES (?, ?, ?, ?)`,
    [id, JSON.stringify(payload), JSON.stringify(mediaPaths), new Date().toISOString()]
  );
}

export function getQueuedIncidents() {
  return db.getAllSync<any>(`SELECT * FROM offline_queue ORDER BY created_at ASC`);
}

export function removeFromQueue(id: string) {
  db.runSync(`DELETE FROM offline_queue WHERE id = ?`, [id]);
}

export function incrementRetryCount(id: string, error: string) {
  db.runSync(
    `UPDATE offline_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?`,
    [error, id]
  );
}
```

### D2. Offline Sync Hook

Create `apps/mobile/src/hooks/useOfflineQueue.ts`:

```typescript
import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getQueuedIncidents, removeFromQueue, incrementRetryCount } from '../db/offlineDb';
import { apiClient } from '../api/client';

/**
 * Runs a background loop that:
 * 1. Listens for network connectivity changes
 * 2. When connected, reads all pending items from SQLite
 * 3. Attempts to submit each one to the API
 * 4. On success: removes from queue
 * 5. On failure: increments retry count (max 5 retries before dropping)
 */
export function useOfflineQueue() {
  // Implement using NetInfo.addEventListener
  // Run sync immediately when connectivity is restored
  // Use exponential backoff for retries
}
```

Install required package:
```bash
npx expo install @react-native-community/netinfo
```

---

## Part E — Socket.io Real-time (Client Side)

### E1. Mobile Socket Setup

Create `apps/mobile/src/lib/socket.ts`:

```typescript
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket: Socket | null = null;

export function connectSocket() {
  const token = useAuthStore.getState().accessToken;
  socket = io(process.env.EXPO_PUBLIC_API_URL?.replace('/v1', '') ?? 'http://localhost:4000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));

  return socket;
}

export function getSocket(): Socket {
  if (!socket) connectSocket();
  return socket!;
}

export function joinIncidentRoom(incidentId: string) {
  getSocket().emit('join:incident', incidentId);
}

export function leaveIncidentRoom(incidentId: string) {
  getSocket().emit('leave:incident', incidentId);
}
```

### E2. Backend Socket Setup (update from Chapter 1 scaffold)

Update `apps/api/src/socket/socket.ts` with the following rooms and events:

```typescript
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: '*', credentials: true },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const user = jwt.verify(token, env.JWT_SECRET);
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;

    // Citizen joins their personal room to receive updates on their reports
    socket.join(`user:${user.id}`);

    // Officers join their agency room to receive new incident alerts
    if (user.role !== 'CITIZEN') {
      socket.join(`agency:${user.agencyType}`);
    }

    // Room for a specific incident (for citizen-officer chat)
    socket.on('join:incident', (incidentId: string) => {
      socket.join(`incident:${incidentId}`);
    });

    socket.on('leave:incident', (incidentId: string) => {
      socket.leave(`incident:${incidentId}`);
    });

    socket.on('disconnect', () => {});
  });
}

// Helper functions used by services to emit events
export const socketEmit = {
  newIncident: (agencyType: string, incident: any) =>
    io.to(`agency:${agencyType}`).emit('incident:new', incident),

  incidentUpdated: (incidentId: string, userId: string, update: any) => {
    io.to(`incident:${incidentId}`).emit('incident:updated', update);
    io.to(`user:${userId}`).emit('incident:updated', update);
  },

  newMessage: (incidentId: string, message: any) =>
    io.to(`incident:${incidentId}`).emit('message:new', message),
};
```

---

## Part F — Environment Variables for Apps

### Mobile (`apps/mobile/.env`)
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/v1
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

### Web Citizen (`apps/web-citizen/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

---

## Definition of Done for Chapter 2

The developer must confirm ALL of the following before moving to Chapter 3:

**Backend (API)**
- [ ] `POST /v1/incidents` creates incident with tracking code and routes to correct agency
- [ ] Incident with type ACCIDENT routes to both POLICE and HOSPITAL
- [ ] Incident with type MEDICAL_EMERGENCY routes to HOSPITAL only
- [ ] `GET /v1/incidents/track/:code` works without authentication
- [ ] `POST /v1/incidents/:id/media` uploads photo to Cloudinary and saves URL to DB
- [ ] `PATCH /v1/incidents/:id/status` by a citizen returns 403 Forbidden
- [ ] Socket.io emits `incident:new` event when incident is created
- [ ] Push notification is triggered when incident status changes
- [ ] All 8 API tests in `incidents.test.ts` pass

**Mobile App**
- [ ] Welcome screen shows language selection and language preference persists
- [ ] Phone entry screen validates Rwandan number format correctly
- [ ] OTP verify screen logs in user and navigates to home
- [ ] Home screen SOS button opens type selector bottom sheet
- [ ] Report form completes all 3 steps and submits successfully
- [ ] After submission, tracking code is shown on success screen
- [ ] My Reports screen shows list of user's past reports
- [ ] Report detail screen shows status timeline and chat
- [ ] Map screen shows nearest police, hospital, and fire stations
- [ ] Offline: submitting a report without internet queues it to SQLite
- [ ] When internet returns, queued report is automatically submitted

**Web Portal**
- [ ] Landing page renders with SOS button and 4 quick action cards
- [ ] Report form works end-to-end and shows tracking code on success
- [ ] Public tracking page shows status for a known tracking code without login
- [ ] My Reports page is protected (redirects to login if not authenticated)

---

## Notes for Developer

- In development, test Socket.io events using Postman's WebSocket client or `wscat`.
- For Cloudinary in development, create a free account at cloudinary.com. The free tier supports up to 25GB storage and 25GB bandwidth/month which is sufficient for development.
- The Google Maps API key needs "Maps JavaScript API", "Geocoding API", and "Places API" enabled.
- For testing media upload without Cloudinary credentials, mock the `cloudinary.uploader.upload` method in tests.
- All date/time values in the database are stored in UTC. Display in the user's local time in the UI.
- The anonymous report flow: if `isAnonymous: true`, do NOT save the `reporterId` to the incident. If the user is not authenticated, allow the request without a token for anonymous-only submission.
- Refer to the Rwanda Safe SSD v1.0, Chapter 4 for the full citizen feature specification.

---

*End of Chapter 2 Developer Prompt — Rwanda Safe v1.0*
