# Rwanda Safe — Full Developer Prompt: Chapter 4 (Hospital / SAMU Dashboard)

> **Document Reference:** Rwanda Safe SSD v1.0, Chapter 6  
> **Depends on:** Chapters 1 ✅, 2 ✅, and 3 ✅ fully completed  
> **Purpose:** Build the complete Hospital / SAMU dashboard — used by emergency medical dispatchers to receive medical reports, dispatch ambulances, manage hospital capacity, coordinate patient transport, and support telemedicine for non-critical cases.

---

## What This Chapter Builds

By the end of Chapter 4 your developer will have:

1. Hospital dashboard Next.js app — all screens fully working
2. Medical triage system (4-level: Immediate / Urgent / Delayed / Expectant)
3. Ambulance dispatch with real-time GPS tracking
4. Hospital capacity board (beds, ICU, blood bank, specialist availability)
5. Patient pre-arrival data sharing with receiving hospital
6. Mass casualty mode (special multi-victim interface)
7. Telemedicine link for non-critical cases
8. Blood type alert system
9. New backend API endpoints for medical-specific features
10. Reuse of the Chapter 3 dashboard architecture with HOSPITAL agency type
11. Full test coverage for new endpoints

---

## Important: Code Reuse from Chapter 3

The hospital dashboard **reuses the same Next.js codebase** as the police dashboard. Many components are shared. The key difference is:

```env
# apps/dashboard-hospital/.env.local
NEXT_PUBLIC_AGENCY_TYPE=HOSPITAL
```

This means:
- The incident feed shows only `MEDICAL_EMERGENCY` and `ACCIDENT` type incidents
- The map shows ambulance units instead of police vehicles
- The "Assign" modal shows ambulances + medical staff instead of officers
- The analytics page uses medical-specific metrics (response time, triage levels)

Copy these files from `apps/dashboard-police/` to `apps/dashboard-hospital/` and adapt them:
- `src/lib/apiClient.ts` — identical
- `src/lib/socket.ts` — identical
- `src/store/authStore.ts` — identical
- `src/hooks/useIncidentFeed.ts` — identical
- `src/components/shared/` — all shared components identical
- `src/components/layout/` — identical, just change the logo color to red/medical

Only these files need to be **built fresh** for Hospital:
- `src/components/incidents/TriageBadge.tsx` — replaces `SeverityBadge`
- `src/components/ambulance/` — new folder (ambulance dispatch)
- `src/components/capacity/` — new folder (hospital capacity board)
- `src/app/dashboard/capacity/` — new page
- `src/app/dashboard/dispatch/` — new page
- `src/app/dashboard/telemedicine/` — new page

---

## Part A — Backend: New Medical-Specific API Endpoints

### A1. New Files to Create

```
apps/api/src/modules/
├── medical/
│   ├── medical.router.ts
│   ├── medical.controller.ts
│   ├── medical.service.ts
│   └── medical.schema.ts
└── capacity/
    ├── capacity.router.ts
    ├── capacity.controller.ts
    ├── capacity.service.ts
    └── capacity.schema.ts
```

---

### A2. New Prisma Models

Add these models to `apps/api/prisma/schema.prisma`:

```prisma
enum TriageLevel {
  IMMEDIATE    // Red — life-threatening, treat now
  URGENT       // Orange — serious but can wait 30 min
  DELAYED      // Yellow — stable, can wait hours
  EXPECTANT    // Black — unlikely to survive, comfort care
}

enum AmbulanceStatus {
  AVAILABLE
  DISPATCHED
  ON_SCENE
  TRANSPORTING
  AT_HOSPITAL
  OFF_DUTY
  MAINTENANCE
}

enum BloodType {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
  UNKNOWN
}

model MedicalCase {
  id                String        @id @default(uuid())
  incidentId        String        @unique @map("incident_id")
  triageLevel       TriageLevel   @default(URGENT)
  reportedSymptoms  String[]      @map("reported_symptoms")
  patientAge        Int?          @map("patient_age")
  patientGender     String?       @map("patient_gender")
  patientBloodType  BloodType     @default(UNKNOWN) @map("patient_blood_type")
  isConscious       Boolean?      @map("is_conscious")
  isBreathing       Boolean?      @map("is_breathing")
  vitalSigns        Json?         @map("vital_signs")
  medicalNotes      String?       @map("medical_notes")
  receivingHospitalId String?     @map("receiving_hospital_id")
  ambulanceId       String?       @map("ambulance_id")
  dispatchedAt      DateTime?     @map("dispatched_at")
  arrivedSceneAt    DateTime?     @map("arrived_scene_at")
  arrivedHospitalAt DateTime?     @map("arrived_hospital_at")
  isMassCasualty    Boolean       @default(false) @map("is_mass_casualty")
  massCasualtyId    String?       @map("mass_casualty_id")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  incident          Incident      @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  ambulance         Ambulance?    @relation(fields: [ambulanceId], references: [id])
  receivingHospital HospitalCapacity? @relation(fields: [receivingHospitalId], references: [id])

  @@map("medical_cases")
}

model Ambulance {
  id              String          @id @default(uuid())
  agencyId        String          @map("agency_id")
  callSign        String          @unique @map("call_sign")
  plateNumber     String?         @unique @map("plate_number")
  status          AmbulanceStatus @default(AVAILABLE)
  currentLat      Float?          @map("current_lat")
  currentLng      Float?          @map("current_lng")
  crewCount       Int             @default(2) @map("crew_count")
  hasDefibrillator Boolean        @default(true) @map("has_defibrillator")
  hasOxygen       Boolean         @default(true) @map("has_oxygen")
  isActive        Boolean         @default(true) @map("is_active")
  lastUpdated     DateTime        @default(now()) @map("last_updated")
  createdAt       DateTime        @default(now()) @map("created_at")

  agency          Agency          @relation(fields: [agencyId], references: [id])
  medicalCases    MedicalCase[]

  @@map("ambulances")
}

model HospitalCapacity {
  id                    String    @id @default(uuid())
  agencyId              String    @unique @map("agency_id")
  emergencyBedsTotal    Int       @default(0) @map("emergency_beds_total")
  emergencyBedsAvail    Int       @default(0) @map("emergency_beds_avail")
  icuBedsTotal          Int       @default(0) @map("icu_beds_total")
  icuBedsAvail          Int       @default(0) @map("icu_beds_avail")
  bloodBankAPos         Int       @default(0) @map("blood_bank_a_pos")
  bloodBankANeg         Int       @default(0) @map("blood_bank_a_neg")
  bloodBankBPos         Int       @default(0) @map("blood_bank_b_pos")
  bloodBankBNeg         Int       @default(0) @map("blood_bank_b_neg")
  bloodBankOPos         Int       @default(0) @map("blood_bank_o_pos")
  bloodBankONeg         Int       @default(0) @map("blood_bank_o_neg")
  bloodBankABPos        Int       @default(0) @map("blood_bank_ab_pos")
  bloodBankABNeg        Int       @default(0) @map("blood_bank_ab_neg")
  surgeonOnCall         Boolean   @default(false) @map("surgeon_on_call")
  neurologistOnCall     Boolean   @default(false) @map("neurologist_on_call")
  cardiologistOnCall    Boolean   @default(false) @map("cardiologist_on_call")
  pediatricianOnCall    Boolean   @default(false) @map("pediatrician_on_call")
  isAcceptingPatients   Boolean   @default(true) @map("is_accepting_patients")
  statusMessage         String?   @map("status_message")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  agency                Agency    @relation(fields: [agencyId], references: [id])
  incomingCases         MedicalCase[]

  @@map("hospital_capacity")
}

model MassCasualtyEvent {
  id            String    @id @default(uuid())
  title         String
  description   String?
  location      String
  latitude      Float
  longitude     Float
  estimatedCount Int      @default(0) @map("estimated_count")
  isActive      Boolean   @default(true) @map("is_active")
  createdById   String    @map("created_by_id")
  createdAt     DateTime  @default(now()) @map("created_at")
  resolvedAt    DateTime? @map("resolved_at")

  @@map("mass_casualty_events")
}

model TelemedicineSession {
  id            String    @id @default(uuid())
  incidentId    String    @map("incident_id")
  citizenUserId String    @map("citizen_user_id")
  doctorId      String?   @map("doctor_id")
  sessionUrl    String?   @map("session_url")
  status        String    @default("PENDING")
  startedAt     DateTime? @map("started_at")
  endedAt       DateTime? @map("ended_at")
  notes         String?
  createdAt     DateTime  @default(now()) @map("created_at")

  incident      Incident  @relation(fields: [incidentId], references: [id])

  @@map("telemedicine_sessions")
}
```

Also add these relations to existing models:
- `Incident` model: add `medicalCase MedicalCase?` and `telemedicineSessions TelemedicineSession[]`
- `Agency` model: add `ambulances Ambulance[]`, `hospitalCapacity HospitalCapacity?`

After editing, run:
```bash
cd apps/api && npx prisma migrate dev --name add_medical_models
```

---

### A3. Medical Service

Create `apps/api/src/modules/medical/medical.service.ts`:

```typescript
import { prisma } from '../../config/database';
import { TriageLevel, BloodType, AmbulanceStatus } from '@prisma/client';
import { socketEmit } from '../../socket/socket';
import { notificationsService } from '../notifications/notifications.service';

export const medicalService = {

  /**
   * Creates or updates the MedicalCase record linked to an incident.
   * Called when an officer sets triage level, adds patient vitals, etc.
   * If blood type is known, checks blood bank availability and emits alert
   * if the blood type is critically low (less than 2 units).
   */
  async setTriageLevel(
    incidentId: string,
    triageLevel: TriageLevel,
    patientData: {
      symptoms?: string[];
      age?: number;
      gender?: string;
      bloodType?: BloodType;
      isConscious?: boolean;
      isBreathing?: boolean;
      vitalSigns?: object;
    },
    officerId: string
  ),

  /**
   * Dispatches an ambulance to an incident.
   * 1. Checks ambulance is AVAILABLE
   * 2. Sets ambulance status to DISPATCHED
   * 3. Links ambulance to MedicalCase
   * 4. Records dispatchedAt timestamp
   * 5. Emits Socket.io "ambulance:dispatched" to hospital agency room
   * 6. Sends push notification to any nearby responders (future scope)
   * Returns: ambulance details + estimated arrival time (straight-line distance calc)
   */
  async dispatchAmbulance(
    incidentId: string,
    ambulanceId: string,
    dispatchedById: string
  ),

  /**
   * Updates ambulance status and GPS location.
   * Valid transitions:
   *   DISPATCHED → ON_SCENE → TRANSPORTING → AT_HOSPITAL → AVAILABLE
   * Emits "ambulance:updated" Socket.io event to hospital agency room.
   * When status becomes AT_HOSPITAL: sets dispatchedAt metrics for analytics.
   */
  async updateAmbulanceStatus(
    ambulanceId: string,
    status: AmbulanceStatus,
    lat?: number,
    lng?: number
  ),

  /**
   * Recommends the best hospital to receive the patient.
   * Algorithm:
   *   1. Filter hospitals that are isAcceptingPatients = true
   *   2. Filter hospitals with at least 1 emergency bed available
   *   3. If triage is IMMEDIATE: also require ICU bed available
   *   4. If blood type known: prefer hospitals with that blood type in stock
   *   5. Among remaining: sort by distance from incident GPS (Haversine)
   *   6. Return top 3 recommendations with: name, distance, available beds, ETA
   */
  async recommendHospital(
    incidentLat: number,
    incidentLng: number,
    triageLevel: TriageLevel,
    bloodType?: BloodType
  ),

  /**
   * Sets the receiving hospital for a medical case.
   * Decrements that hospital's emergencyBedsAvail by 1.
   * If triageLevel is IMMEDIATE: also decrements icuBedsAvail.
   * Emits "capacity:updated" Socket.io event.
   * Saves pre-arrival patient data to MedicalCase.
   */
  async assignReceivingHospital(
    incidentId: string,
    hospitalId: string,
    officerId: string
  ),

  /**
   * Creates a MassCasualtyEvent and links all related incidents to it.
   * Activates MASS_CASUALTY_MODE for the hospital dashboard (Socket.io event).
   * Triggers broadcast alert to all medical staff.
   */
  async activateMassCasualtyMode(
    data: { title: string; description: string; location: string; lat: number; lng: number; estimatedCount: number },
    createdById: string
  ),

  /**
   * Creates a telemedicine session for a non-critical case.
   * Generates a video call URL (use a free service like Daily.co or Jitsi).
   * Sends the URL to the citizen via push notification and SMS.
   * Returns the session URL for the dispatcher to open on their side.
   */
  async createTelemedicineSession(
    incidentId: string,
    citizenUserId: string,
    doctorId?: string
  ),

  /**
   * Checks blood bank levels across all hospitals.
   * Returns: for each blood type, total units available across all hospitals.
   * Flags any blood type with < 5 units total as CRITICAL.
   */
  async getBloodBankStatus(),
};
```

---

### A4. Capacity Service

Create `apps/api/src/modules/capacity/capacity.service.ts`:

```typescript
export const capacityService = {

  /**
   * Returns capacity data for ALL hospitals registered in the system.
   * For each hospital:
   *   - name, location, phone
   *   - emergency beds: total / available / occupancy %
   *   - ICU beds: total / available
   *   - blood bank: all 8 blood types with unit counts
   *   - specialists on call (4 booleans)
   *   - isAcceptingPatients
   *   - statusMessage
   *   - distance from a given lat/lng (optional param)
   * Used by the Hospital Capacity Board page.
   */
  async getAllHospitalsCapacity(fromLat?: number, fromLng?: number),

  /**
   * Returns capacity data for a single hospital.
   */
  async getHospitalCapacity(agencyId: string),

  /**
   * Updates capacity data for a hospital.
   * Called by hospital staff when beds become available or occupied.
   * Emits "capacity:updated" Socket.io event to hospital agency room.
   * If any ICU beds drop to 0: emits "capacity:critical" alert.
   */
  async updateCapacity(agencyId: string, data: UpdateCapacityInput, updatedById: string),

  /**
   * Increments available beds when a patient is discharged.
   * Type: "emergency" or "icu"
   */
  async releasebed(agencyId: string, bedType: 'emergency' | 'icu'),
};
```

---

### A5. New API Endpoints

Register all routes in `apps/api/src/app.ts`.

**Medical endpoints** (officer/admin role required):
```
POST   /v1/medical/:incidentId/triage        Set triage level + patient data
POST   /v1/medical/:incidentId/dispatch      Dispatch ambulance to incident
PATCH  /v1/medical/ambulances/:id/status     Update ambulance status + GPS
GET    /v1/medical/:incidentId/recommend     Get hospital recommendations
POST   /v1/medical/:incidentId/hospital      Assign receiving hospital
POST   /v1/medical/mass-casualty             Activate mass casualty mode
POST   /v1/medical/:incidentId/telemedicine  Create telemedicine session
GET    /v1/medical/blood-bank                Get blood bank status all hospitals
```

**Ambulance endpoints:**
```
GET    /v1/ambulances                        List all ambulances for agency
GET    /v1/ambulances/available              Available ambulances only
PATCH  /v1/ambulances/:id/location           Update ambulance GPS (called from crew device)
```

**Capacity endpoints:**
```
GET    /v1/capacity                          All hospitals capacity board
GET    /v1/capacity/:agencyId               Single hospital capacity
PATCH  /v1/capacity/:agencyId               Update hospital capacity
POST   /v1/capacity/:agencyId/release-bed   Release a bed (patient discharged)
```

---

### A6. New Socket.io Events

Update `apps/api/src/socket/socket.ts` — add these to the `socketEmit` helper:

```typescript
export const socketEmit = {
  // ... existing events from Chapter 3 ...

  // Ambulance dispatched to an incident
  ambulanceDispatched: (incidentId: string, ambulanceData: any) =>
    io.to(`incident:${incidentId}`).emit('ambulance:dispatched', ambulanceData),

  // Ambulance GPS or status update
  ambulanceUpdated: (agencyId: string, ambulanceData: any) =>
    io.to(`agency:HOSPITAL`).emit('ambulance:updated', ambulanceData),

  // Hospital capacity changed
  capacityUpdated: (hospitalData: any) =>
    io.to(`agency:HOSPITAL`).emit('capacity:updated', hospitalData),

  // Critical capacity — ICU beds at 0
  capacityCritical: (hospitalName: string, message: string) =>
    io.to(`agency:HOSPITAL`).emit('capacity:critical', { hospitalName, message }),

  // Mass casualty mode activated
  massCasualtyActivated: (eventData: any) => {
    io.to(`agency:HOSPITAL`).emit('mass_casualty:activated', eventData);
    io.to(`agency:POLICE`).emit('mass_casualty:activated', eventData);
    io.to(`agency:FIRE`).emit('mass_casualty:activated', eventData);
  },

  // Telemedicine session ready
  telemedicineReady: (userId: string, sessionUrl: string) =>
    io.to(`user:${userId}`).emit('telemedicine:ready', { sessionUrl }),
};
```

---

### A7. Seed Ambulances and Hospital Capacity

Update `apps/api/src/database/seed.ts` to also seed:

```typescript
// Seed 5 ambulances for King Faisal Hospital SAMU
const ambulances = [
  { callSign: 'AMB-001', plateNumber: 'RAC 001A', hasDefibrillator: true, hasOxygen: true },
  { callSign: 'AMB-002', plateNumber: 'RAC 002A', hasDefibrillator: true, hasOxygen: true },
  { callSign: 'AMB-003', plateNumber: 'RAC 003A', hasDefibrillator: false, hasOxygen: true },
  { callSign: 'AMB-004', plateNumber: 'RAC 004A', hasDefibrillator: true, hasOxygen: true },
  { callSign: 'AMB-005', plateNumber: 'RAC 005A', hasDefibrillator: true, hasOxygen: false },
];

// Seed hospital capacity for King Faisal + 2 other hospitals
const hospitalCapacities = [
  {
    // King Faisal Hospital
    emergencyBedsTotal: 30, emergencyBedsAvail: 12,
    icuBedsTotal: 10, icuBedsAvail: 3,
    bloodBankOPos: 15, bloodBankONeg: 4, bloodBankAPos: 8,
    surgeonOnCall: true, cardiologistOnCall: true,
    isAcceptingPatients: true,
  },
  {
    // CHUK (Centre Hospitalier Universitaire de Kigali)
    emergencyBedsTotal: 50, emergencyBedsAvail: 22,
    icuBedsTotal: 15, icuBedsAvail: 6,
    bloodBankOPos: 20, bloodBankONeg: 2, bloodBankBPos: 10,
    surgeonOnCall: true, neurologistOnCall: true,
    isAcceptingPatients: true,
  },
];
```

---

## Part B — Hospital Dashboard Next.js App

### B1. Setup

```bash
# Copy base structure from police dashboard
cp -r apps/dashboard-police apps/dashboard-hospital
cd apps/dashboard-hospital

# Update package.json name
# Change "name": "@rwanda-safe/dashboard-police" → "@rwanda-safe/dashboard-hospital"

# Update .env.local
echo "NEXT_PUBLIC_AGENCY_TYPE=HOSPITAL" > .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/v1" >> .env.local
echo "NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key" >> .env.local
echo "NEXT_PUBLIC_APP_NAME=Rwanda Safe — Hospital Dashboard" >> .env.local
```

### B2. Hospital-Specific Theme

Update `src/constants/theme.ts` in the hospital dashboard:

```typescript
export const HospitalTheme = {
  // Medical red theme instead of police navy
  sidebar:        '#1A0A0A',   // Very dark red-black
  sidebarActive:  '#5C1A1A',
  topbar:         '#FFFFFF',
  background:     '#FFF5F5',
  surface:        '#FFFFFF',
  border:         '#FFE0E0',
  primary:        '#C62828',   // Medical red
  primaryHover:   '#B71C1C',

  // Triage colors (START triage system)
  triageImmediate: '#D32F2F',   // Red — treat now
  triageUrgent:    '#F57C00',   // Orange — 30 min
  triageDelayed:   '#FDD835',   // Yellow — hours
  triageExpectant: '#212121',   // Black — palliative

  // Ambulance status
  ambulanceAvailable:   '#22C55E',
  ambulanceDispatched:  '#F59E0B',
  ambulanceOnScene:     '#EF4444',
  ambulanceTransporting:'#8B5CF6',
  ambulanceAtHospital:  '#3B82F6',

  // Bed availability
  bedsGood:     '#22C55E',   // > 50% available
  bedsWarning:  '#F59E0B',   // 20–50% available
  bedsCritical: '#EF4444',   // < 20% available
  bedsEmpty:    '#94A3B8',   // 0 available
};
```

---

### B3. New Components to Build

Create these new components inside `apps/dashboard-hospital/src/components/`:

#### `incidents/TriageBadge.tsx`

```typescript
/**
 * Replaces SeverityBadge for the hospital dashboard.
 * Shows triage level using START triage colors.
 *
 * Props: level: 'IMMEDIATE' | 'URGENT' | 'DELAYED' | 'EXPECTANT'
 *
 * IMMEDIATE → red badge with "IMMEDIATE" label
 * URGENT    → orange badge with "URGENT" label
 * DELAYED   → yellow badge with "DELAYED" label
 * EXPECTANT → black badge with "EXPECTANT" label
 *
 * Also shows a colored left border on incident rows (same color as badge).
 */
export function TriageBadge({ level }: { level: TriageLevel }) {}
```

#### `incidents/PatientCard.tsx`

```typescript
/**
 * Shown inside the incident detail drawer for medical cases.
 * Displays: triage level, reported symptoms, patient age/gender,
 * blood type (with alert icon if critical blood bank level),
 * conscious/breathing status, vital signs if recorded.
 *
 * Has "Set Triage" button that opens TriageModal.
 * Has "Recommend Hospital" button that fetches and shows recommendations.
 */
export function PatientCard({ incidentId, medicalCase }: PatientCardProps) {}
```

#### `incidents/TriageModal.tsx`

```typescript
/**
 * Modal to set/update triage level and patient data.
 *
 * Fields:
 *   Triage level (4 large colored buttons: Immediate/Urgent/Delayed/Expectant)
 *   Reported symptoms (multi-select chips):
 *     Chest Pain, Difficulty Breathing, Unconscious, Heavy Bleeding,
 *     Fracture, Burns, Stroke Symptoms, Seizure, Allergic Reaction, Other
 *   Patient age (number input, optional)
 *   Patient gender (Male/Female/Unknown, optional)
 *   Blood type (dropdown, optional) — shows blood bank alert if < 2 units
 *   Is conscious? (Yes/No/Unknown toggle)
 *   Is breathing? (Yes/No/Unknown toggle)
 *   Vital signs (optional collapsible section):
 *     Blood pressure (systolic/diastolic), Heart rate, SpO2, Temperature
 *
 * Buttons: Cancel | Save Triage
 */
export function TriageModal({ incidentId, onClose }: TriageModalProps) {}
```

#### `ambulance/AmbulanceDispatchPanel.tsx`

```typescript
/**
 * Shown in the incident detail drawer for medical cases.
 * If no ambulance dispatched yet:
 *   - Shows "Dispatch Ambulance" button
 *   - Opens AmbulanceSelectModal
 * If ambulance already dispatched:
 *   - Shows ambulance call sign + current status
 *   - Shows status update buttons (valid transitions only)
 *   - Shows ETA / time since dispatch
 *   - "Change Ambulance" option (if status is still DISPATCHED)
 */
export function AmbulanceDispatchPanel({ incidentId, medicalCase }: AmbulancePanelProps) {}
```

#### `ambulance/AmbulanceSelectModal.tsx`

```typescript
/**
 * Modal to select which ambulance to dispatch.
 *
 * Shows list of AVAILABLE ambulances:
 *   [AMB-001] — Available — Defibrillator ✅ Oxygen ✅ — Crew: 2
 *   [AMB-002] — Available — Defibrillator ✅ Oxygen ✅ — Crew: 2
 *   [AMB-003] — Dispatched (grayed out)
 *
 * Each row shows distance from incident location.
 * Sort by: closest first.
 *
 * Confirm button: "Dispatch [AMB-001] to this incident"
 *
 * On confirm: calls POST /v1/medical/:incidentId/dispatch
 */
export function AmbulanceSelectModal({ incidentId, incidentLat, incidentLng, onClose }: Props) {}
```

#### `ambulance/AmbulanceFleetPanel.tsx`

```typescript
/**
 * Shows on the dispatch page — full fleet overview.
 * Grid of ambulance cards showing:
 *   - Call sign (large)
 *   - Status badge (colored)
 *   - Current assignment (incident tracking code, if dispatched)
 *   - Location on map (mini map thumbnail, or "Location unknown")
 *   - Equipment: defibrillator icon, oxygen icon
 *   - Time in current status (e.g. "Dispatched 8 min ago")
 * Click card → opens ambulance detail sidebar
 */
export function AmbulanceFleetPanel({ ambulances }: Props) {}
```

#### `capacity/HospitalCapacityBoard.tsx`

```typescript
/**
 * Full capacity board showing all hospitals in the system.
 * For each hospital:
 *
 *   [Hospital Name]                    [Accepting ✅ / Not Accepting ❌]
 *   Emergency Beds: ████░░░░  12/30    ICU Beds: ██░░░░░░  3/10
 *   Blood Bank: A+ ✅  A- ⚠️  B+ ✅  B- ❌  O+ ✅  O- ✅  AB+ ✅  AB- ❌
 *   On Call: Surgeon ✅  Neurologist ❌  Cardiologist ✅  Pediatrician ✅
 *   [Update Capacity] button
 *
 * Color coding for beds:
 *   > 50% available = green progress bar
 *   20-50% = yellow
 *   < 20% = red
 *   0 = flashing red
 *
 * Color coding for blood bank:
 *   > 5 units = ✅ green
 *   2–5 units = ⚠️ yellow
 *   < 2 units = ❌ red (triggers blood bank alert)
 */
export function HospitalCapacityBoard({ hospitals }: Props) {}
```

#### `capacity/UpdateCapacityModal.tsx`

```typescript
/**
 * Modal for hospital staff to update their capacity data.
 * Fields:
 *   Emergency beds available (number input)
 *   ICU beds available (number input)
 *   Blood bank units for each of 8 blood types (8 number inputs)
 *   Specialists on call (4 toggles: Surgeon, Neurologist, Cardiologist, Pediatrician)
 *   Accepting patients? (Yes/No toggle)
 *   Status message (optional text, e.g. "Oxygen supply limited")
 *
 * Calls: PATCH /v1/capacity/:agencyId
 */
export function UpdateCapacityModal({ agencyId, currentCapacity, onClose }: Props) {}
```

#### `capacity/HospitalRecommendation.tsx`

```typescript
/**
 * Shows inside incident detail drawer after clicking "Recommend Hospital".
 * Displays top 3 recommended hospitals with:
 *   Rank badge (1st, 2nd, 3rd)
 *   Hospital name
 *   Distance from incident (km)
 *   Available emergency beds
 *   ICU beds (highlighted if triage is IMMEDIATE)
 *   Has required blood type? (checkmark or X)
 *   "Assign This Hospital" button → calls POST /v1/medical/:incidentId/hospital
 */
export function HospitalRecommendation({ recommendations, incidentId, onAssigned }: Props) {}
```

#### `mass-casualty/MassCasualtyBanner.tsx`

```typescript
/**
 * Shown at the very top of the dashboard when a MassCasualtyEvent is active.
 * Full-width red banner with flashing animation:
 *
 *   ⚠️ MASS CASUALTY EVENT ACTIVE — [Event Title] — [Location] — Est. [N] victims
 *   [View Details] [Resolve Event]
 *
 * Persists across all pages until the event is resolved.
 * Received via Socket.io "mass_casualty:activated" event.
 */
export function MassCasualtyBanner({ event }: Props) {}
```

#### `mass-casualty/MassCasualtyMode.tsx`

```typescript
/**
 * Full-screen overlay activated during a mass casualty event.
 * Replaces the normal incident feed with a specialized multi-victim triage board.
 *
 * Layout: 4 columns (one per triage level)
 *   [IMMEDIATE] [URGENT] [DELAYED] [EXPECTANT]
 *
 * Each column is a Kanban-style list of victim cards.
 * Each victim card shows:
 *   - Victim number (auto-assigned: V-001, V-002, etc.)
 *   - Age/Gender (if known)
 *   - Reported injury
 *   - Assigned ambulance (or "Unassigned")
 *   - Drag to move between triage columns
 *
 * Bottom panel:
 *   - Total victims: [N]
 *   - Ambulances deployed: [N] / [N] available
 *   - Hospitals notified: [N]
 *   - [Dispatch All Available Ambulances] button
 *   - [Notify All Hospitals] button
 *   - [Deactivate Mass Casualty Mode] button
 */
export function MassCasualtyMode({ event, victims }: Props) {}
```

#### `telemedicine/TelemedicinePanel.tsx`

```typescript
/**
 * Shown in the incident detail drawer for non-critical cases.
 * "Start Telemedicine Session" button.
 *
 * On click:
 *   1. Calls POST /v1/medical/:incidentId/telemedicine
 *   2. Shows the session URL in the panel
 *   3. Shows "Citizen has been notified via push notification and SMS"
 *   4. "Open Video Call" button opens the URL in a new tab
 *
 * Session status tracking:
 *   PENDING → "Waiting for citizen to join..."
 *   ACTIVE  → "Session in progress — [duration]"
 *   ENDED   → "Session ended. Add medical notes below."
 */
export function TelemedicinePanel({ incidentId, citizenUserId }: Props) {}
```

---

### B4. Screen Specifications

#### `app/dashboard/page.tsx` — Hospital Overview

Same structure as police overview but with medical metrics:

**5 Stat Cards:**
| Card | Value | Color |
|---|---|---|
| Open Medical Cases | count | Red |
| Immediate Triage | count | Dark Red + pulse |
| Ambulances Available | `X / Y total` | Green |
| Avg Response Time | minutes | Orange |
| Beds Available (Kigali) | count | Blue |

**Live Medical Feed (left 65%):**
- Same as police feed but shows medical/accident incidents only
- Rows show triage badge instead of severity badge
- SLA timer shows time since incident (medical response target: 10 minutes)

**Ambulance Status Panel (right 35%):**
- Mini fleet view: each ambulance as a colored dot
- Green = available, Yellow = dispatched, Red = on scene, Purple = transporting
- Click dot → jump to dispatch page

**Row 2:**
- Left: Blood Bank status summary (all 8 blood types, colored levels)
- Right: Hospital capacity summary (total beds available across all hospitals)

---

#### `app/dashboard/incidents/page.tsx` — Medical Incident List

Same as police incident list but:
- Replace **Severity** column with **Triage** column (triage badge)
- Add **Ambulance** column: dispatched ambulance call sign or "Not dispatched"
- Add **Hospital** column: assigned receiving hospital or "Not assigned"
- SLA target is **10 minutes** (not 15 like police)
- Incident detail drawer shows `PatientCard`, `AmbulanceDispatchPanel`, `HospitalRecommendation`, `TelemedicinePanel`

---

#### `app/dashboard/dispatch/page.tsx` — Ambulance Dispatch Page

**Layout: two panels side by side**

**Left panel (40%) — Fleet Status:**
`AmbulanceFleetPanel` component showing all ambulances.

Bulk actions bar:
- "Dispatch All Available" → dispatches all AVAILABLE ambulances to highest-priority unassigned incidents
- Filter: All / Available / On Scene / Transporting

**Right panel (60%) — Dispatch Map:**
Full Google Maps view showing:
- Ambulance locations as red cross icons (real-time GPS via Socket.io)
- Active incident locations as orange pins
- Click ambulance → see details + assign to incident
- Click incident pin → see details + dispatch ambulance
- Route lines drawn between dispatched ambulances and their assigned incidents

**Status ticker at top:**
```
🟢 Available: 3   🟡 Dispatched: 1   🔴 On Scene: 2   🟣 Transporting: 1
```

---

#### `app/dashboard/capacity/page.tsx` — Hospital Capacity Board

Full `HospitalCapacityBoard` component.

Top controls:
- "Update My Hospital's Capacity" button → opens `UpdateCapacityModal`
- Auto-refresh toggle (updates every 2 minutes)
- Last updated: "Updated 3 min ago"

**Blood Bank Summary (top section):**
Overall blood bank status across ALL hospitals:
```
A+  23 units  ✅    A-   4 units  ⚠️
B+  15 units  ✅    B-   1 unit   ❌  CRITICAL
O+  38 units  ✅    O-   6 units  ⚠️
AB+  8 units  ✅    AB-  2 units  ⚠️
```

Any blood type marked ❌ shows a red alert banner:
"B- blood type critically low across all hospitals (1 unit). Consider urgent procurement."

**Hospitals grid below** — `HospitalCapacityBoard` component.

---

#### `app/dashboard/telemedicine/page.tsx` — Telemedicine Sessions

List of all active and past telemedicine sessions.

**Active sessions table:**
| Tracking Code | Citizen | Status | Duration | Actions |
|---|---|---|---|---|
| RW-2026-00421 | +250788... | In Progress | 12 min | Join Call |
| RW-2026-00419 | Anonymous | Waiting | - | Cancel |

**Past sessions table:**
| Date | Tracking Code | Duration | Doctor Notes | Outcome |
|---|---|---|---|---|

"Start New Session" button (opens incident selector).

---

#### `app/dashboard/map/page.tsx` — Medical Map

Same as police map but:
- Incident pins: red cross icons (medical) + orange circle (accidents)
- Ambulance pins: animated icons showing movement direction
- Hospital markers: show capacity status (green/yellow/red dot)
- Click hospital marker → shows capacity popup with bed counts
- Route lines: drawn from dispatched ambulances to their incidents
- Filter: show/hide: incidents, ambulances, hospitals, clinics

---

#### `app/dashboard/analytics/page.tsx` — Medical Analytics

All medical-specific metrics:

**Row 1 — KPI Cards:**
- Total cases this month
- Average response time (dispatch to scene)
- Average transport time (scene to hospital)
- Triage breakdown: Immediate / Urgent / Delayed / Expectant (4 mini cards)

**Row 2 — Charts:**
- Left: Triage level trend (stacked bar chart by day)
- Right: Response time by district (bar chart)

**Row 3:**
- Ambulance utilization rate (how often each ambulance is used)
- Most common symptoms reported (horizontal bar chart, top 10)

**Row 4:**
- Hospital occupancy trend over time (line chart, one line per hospital)
- Blood bank consumption rate (which types used most)

---

### B5. Mass Casualty Mode Integration

In the dashboard layout (`app/dashboard/layout.tsx`), add:

```typescript
// Listen for mass casualty event
useEffect(() => {
  const socket = getSocket();

  socket.on('mass_casualty:activated', (event) => {
    // 1. Show MassCasualtyBanner at top of all pages
    setMassCasualtyEvent(event);
    // 2. Show toast notification
    toast.error(`⚠️ MASS CASUALTY EVENT: ${event.title}`, { duration: 0 });
    // 3. Play alert sound (use Web Audio API)
    playAlertSound();
  });

  return () => socket.off('mass_casualty:activated');
}, []);
```

---

### B6. Real-time Hooks (Hospital-specific)

#### `hooks/useAmbulanceFleet.ts`

```typescript
/**
 * Manages ambulance fleet data with real-time updates.
 *
 * 1. Initial load: GET /v1/ambulances
 * 2. Subscribe to Socket.io "ambulance:updated" event
 * 3. Update matching ambulance in the list in-place (status + GPS)
 * 4. Returns: ambulances, isLoading, availableCount, dispatchedCount
 */
export function useAmbulanceFleet() {}
```

#### `hooks/useHospitalCapacity.ts`

```typescript
/**
 * Manages hospital capacity with real-time updates.
 *
 * 1. Initial load: GET /v1/capacity
 * 2. Subscribe to Socket.io "capacity:updated" event
 * 3. Update matching hospital in-place
 * 4. Subscribe to "capacity:critical" event → shows toast alert
 * 5. Returns: hospitals, isLoading, totalBedsAvailable, criticalHospitals
 */
export function useHospitalCapacity() {}
```

---

## Part C — Backend Tests for Chapter 4

Create `apps/api/src/modules/medical/medical.test.ts`:

1. `POST /v1/medical/:incidentId/triage` — sets triage level, creates MedicalCase record
2. `POST /v1/medical/:incidentId/triage` — with blood type B- and < 2 units available → emits blood bank alert
3. `POST /v1/medical/:incidentId/dispatch` — dispatches available ambulance, sets status to DISPATCHED
4. `POST /v1/medical/:incidentId/dispatch` — fails if ambulance is already DISPATCHED (400)
5. `GET /v1/medical/:incidentId/recommend` — returns top 3 hospitals sorted by distance
6. `GET /v1/medical/:incidentId/recommend` — excludes hospitals with 0 emergency beds
7. `POST /v1/medical/:incidentId/hospital` — assigns hospital, decrements emergencyBedsAvail
8. `PATCH /v1/medical/ambulances/:id/status` — invalid transition (AVAILABLE → ON_SCENE) returns 400
9. `PATCH /v1/capacity/:agencyId` — updates capacity, emits capacity:updated Socket event
10. `POST /v1/medical/mass-casualty` — creates event, emits mass_casualty:activated to all agency rooms
11. `POST /v1/medical/:incidentId/telemedicine` — creates session record, sends notification to citizen
12. `GET /v1/medical/blood-bank` — returns correct unit counts and flags critical blood types

---

## Definition of Done for Chapter 4

**Backend**
- [ ] `npx prisma migrate dev` runs cleanly with all new medical models
- [ ] `POST /v1/medical/:incidentId/triage` creates MedicalCase record
- [ ] `POST /v1/medical/:incidentId/dispatch` dispatches ambulance and changes status
- [ ] `GET /v1/medical/:incidentId/recommend` returns hospitals sorted by distance correctly
- [ ] Mass casualty activation emits event to POLICE, HOSPITAL, and FIRE agency rooms
- [ ] All 12 medical tests pass

**Hospital Dashboard App**
- [ ] Dashboard runs on port 3002 (`npm run dev -- --port 3002`)
- [ ] Login works (rejects CITIZEN role)
- [ ] Live feed shows only MEDICAL_EMERGENCY and ACCIDENT incidents
- [ ] TriageBadge shows correct color per triage level
- [ ] "Set Triage" button opens TriageModal and saves data
- [ ] Blood type alert shows when blood type has < 2 units in blood bank
- [ ] "Recommend Hospital" returns top 3 sorted by distance
- [ ] "Dispatch Ambulance" opens AmbulanceSelectModal and dispatches correctly
- [ ] Ambulance Fleet panel updates in real-time via Socket.io
- [ ] Hospital Capacity Board shows all hospitals with color-coded beds
- [ ] "Update Capacity" saves changes and updates board immediately
- [ ] Mass casualty banner appears across all pages when event is activated
- [ ] Mass casualty mode shows 4-column Kanban triage board
- [ ] Telemedicine session is created and citizen is notified

**Integration (End-to-End)**
- [ ] Citizen submits MEDICAL_EMERGENCY on mobile app
- [ ] Hospital dashboard receives it on live feed within 2 seconds
- [ ] Dispatcher sets triage to IMMEDIATE
- [ ] Dispatcher dispatches AMB-001
- [ ] Citizen app shows status changed to "Dispatched"
- [ ] Dispatcher assigns King Faisal Hospital — emergencyBedsAvail decrements by 1 on capacity board
- [ ] Incident resolved → citizen can submit feedback rating

---

## Notes for Developer

- The hospital dashboard runs on port **3002** (`npm run dev -- --port 3002`)
- For telemedicine video calls, use the **Jitsi Meet API** (100% free, no account needed). Generate a room URL: `https://meet.jit.si/rwanda-safe-${incidentId}`. No backend needed.
- The mass casualty Kanban board drag-and-drop can be built using `@dnd-kit/core` (lightweight, no extra cost): `npm install @dnd-kit/core @dnd-kit/sortable`
- Ambulance GPS updates should be throttled — the crew device should call `PATCH /v1/ambulances/:id/location` every **30 seconds**, not every second, to avoid overloading the server.
- The `recommendHospital` algorithm uses the Haversine formula from `apps/api/src/utils/distanceCalc.ts` which was scaffolded in Chapter 2.
- Alert sounds in the browser: use the Web Audio API to generate a beep tone — no audio files needed. Only play sounds when the tab is active (`document.visibilityState === 'visible'`).
- Refer to Rwanda Safe SSD v1.0, Chapter 6 for the full Hospital Dashboard feature specification.

---

*End of Chapter 4 Developer Prompt — Rwanda Safe v1.0*
