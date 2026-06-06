# Rwanda Safe — Full Developer Prompt: Chapter 5 (Fire Brigade + RIB Dashboards)

> **Document Reference:** Rwanda Safe SSD v1.0, Chapters 7 & 8  
> **Depends on:** Chapters 1 ✅, 2 ✅, 3 ✅, and 4 ✅ fully completed  
> **Purpose:** Build two authority dashboards in one chapter — Fire Brigade (fire/hazmat/rescue incidents) and Rwanda Investigation Bureau (serious crime investigations). Both reuse the Chapter 3 base architecture with agency-specific features added on top.

---

## What This Chapter Builds

**Fire Brigade Dashboard:**
1. Fire incident feed (fire, explosion, gas leak, rescue, hazmat)
2. Fire unit dispatch with real-time map
3. Hydrant map overlay
4. Building data panel (type, floors, occupancy)
5. Hazmat chemical reference guide
6. Weather/wind direction overlay
7. Post-incident report form

**RIB Dashboard:**
1. Serious crime investigation case management
2. Escalated cases from police (received via ForwardLog)
3. Anonymous tipline management
4. Pattern detection alerts (AI-flagged crime clusters)
5. Evidence vault (secure file management)
6. Suspect management
7. Court-ready case export (PDF)
8. Secure inter-agency sharing

**Backend additions for both:**
- New Prisma models: FireUnit, FireReport, Investigation, Suspect, Tip, PatternAlert
- 20+ new API endpoints
- Full test suites

---

## PART 1 — FIRE BRIGADE DASHBOARD

---

## Part 1A — Backend: Fire-Specific API

### 1A.1 New Prisma Models

Add to `apps/api/prisma/schema.prisma`:

```prisma
enum FireIncidentType {
  STRUCTURAL_FIRE
  VEHICLE_FIRE
  WILDFIRE
  GAS_LEAK
  CHEMICAL_SPILL
  EXPLOSION
  RESCUE_TRAPPED
  ELECTRICAL_FIRE
  OTHER
}

enum FireUnitStatus {
  AVAILABLE
  RESPONDING
  ON_SCENE
  RETURNING
  MAINTENANCE
  OFF_DUTY
}

enum HazmatLevel {
  LEVEL_1   // Minor — no protective equipment needed
  LEVEL_2   // Moderate — basic protective equipment
  LEVEL_3   // Serious — full protective equipment
  LEVEL_4   // Extreme — full hazmat suit required
}

model FireUnit {
  id              String          @id @default(uuid())
  agencyId        String          @map("agency_id")
  callSign        String          @unique @map("call_sign")
  plateNumber     String?         @unique @map("plate_number")
  unitType        String          // "FIRE_TRUCK" | "LADDER_TRUCK" | "RESCUE_UNIT" | "HAZMAT_UNIT"
  status          FireUnitStatus  @default(AVAILABLE)
  crewCount       Int             @default(4) @map("crew_count")
  currentLat      Float?          @map("current_lat")
  currentLng      Float?          @map("current_lng")
  waterCapacityL  Int?            @map("water_capacity_l")
  hasHazmatKit    Boolean         @default(false) @map("has_hazmat_kit")
  isActive        Boolean         @default(true) @map("is_active")
  lastUpdated     DateTime        @default(now()) @map("last_updated")
  createdAt       DateTime        @default(now()) @map("created_at")

  agency          Agency          @relation(fields: [agencyId], references: [id])
  fireReports     FireReport[]

  @@map("fire_units")
}

model FireReport {
  id                  String          @id @default(uuid())
  incidentId          String          @unique @map("incident_id")
  fireType            FireIncidentType @default(STRUCTURAL_FIRE) @map("fire_type")
  hazmatLevel         HazmatLevel?    @map("hazmat_level")
  chemicalInvolved    String?         @map("chemical_involved")
  buildingType        String?         @map("building_type")
  buildingFloors      Int?            @map("building_floors")
  estimatedOccupancy  Int?            @map("estimated_occupancy")
  fireUnitId          String?         @map("fire_unit_id")
  additionalUnitsIds  String[]        @map("additional_units_ids")
  dispatchedAt        DateTime?       @map("dispatched_at")
  arrivedAt           DateTime?       @map("arrived_at")
  containedAt         DateTime?       @map("contained_at")
  resolvedAt          DateTime?       @map("resolved_at")
  windSpeed           Float?          @map("wind_speed")
  windDirection       String?         @map("wind_direction")
  weatherCondition    String?         @map("weather_condition")
  casualties          Int             @default(0)
  postIncidentReport  String?         @map("post_incident_report")
  reportSubmittedAt   DateTime?       @map("report_submitted_at")
  reportSubmittedById String?         @map("report_submitted_by_id")
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  incident            Incident        @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  fireUnit            FireUnit?       @relation(fields: [fireUnitId], references: [id])

  @@map("fire_reports")
}

model Hydrant {
  id          String    @id @default(uuid())
  latitude    Float
  longitude   Float
  district    String?
  address     String?
  isOperational Boolean @default(true) @map("is_operational")
  lastChecked DateTime? @map("last_checked")
  notes       String?
  createdAt   DateTime  @default(now()) @map("created_at")

  @@map("hydrants")
}
```

Add relations to existing models:
- `Incident`: add `fireReport FireReport?`
- `Agency`: add `fireUnits FireUnit[]`

Run migration:
```bash
cd apps/api && npx prisma migrate dev --name add_fire_models
```

---

### 1A.2 Fire Service

Create `apps/api/src/modules/fire/fire.service.ts`:

```typescript
export const fireService = {

  /**
   * Creates or updates a FireReport for an incident.
   * Sets fire type, hazmat level, building data.
   * If hazmatLevel is LEVEL_3 or LEVEL_4: automatically emits
   * "fire:hazmat_alert" Socket.io event to FIRE agency room.
   */
  async createFireReport(incidentId: string, data: FireReportInput, officerId: string),

  /**
   * Dispatches one or more fire units to an incident.
   * 1. Validates all units are AVAILABLE
   * 2. Sets primary unit + additional units on FireReport
   * 3. Sets all dispatched units status to RESPONDING
   * 4. Records dispatchedAt
   * 5. Emits "unit:dispatched" Socket.io event
   * Returns: list of dispatched units + ETAs
   */
  async dispatchUnits(incidentId: string, unitIds: string[], dispatchedById: string),

  /**
   * Updates fire unit status and GPS.
   * Valid transitions:
   *   AVAILABLE → RESPONDING → ON_SCENE → RETURNING → AVAILABLE
   * When status becomes ON_SCENE: records arrivedAt on FireReport.
   * When status becomes RETURNING: records containedAt on FireReport.
   * Emits "unit:updated" Socket.io event.
   */
  async updateUnitStatus(unitId: string, status: FireUnitStatus, lat?: number, lng?: number),

  /**
   * Fetches nearest hydrants to an incident location.
   * Returns up to 10 hydrants sorted by distance (Haversine).
   * Only returns operational hydrants (isOperational = true).
   * Includes distance in meters for each hydrant.
   */
  async getNearestHydrants(lat: number, lng: number, radiusMeters?: number),

  /**
   * Fetches current weather for an incident location.
   * Uses OpenWeatherMap API (free tier).
   * Returns: temperature, wind speed, wind direction (degrees + cardinal),
   *          humidity, conditions (clear/rain/etc).
   * Updates FireReport with weather data.
   */
  async getWeatherData(lat: number, lng: number, incidentId: string),

  /**
   * Looks up a chemical in the built-in hazmat reference guide.
   * The guide is a static JSON file included in the codebase.
   * Returns: chemical name, hazard class, protective equipment needed,
   *          fire response notes, evacuation radius (meters).
   */
  async lookupChemical(query: string),

  /**
   * Submits the post-incident report after fire is resolved.
   * Required fields: fire type, casualties, brief narrative.
   * Sets reportSubmittedAt timestamp.
   * Changes incident status to CLOSED.
   */
  async submitPostIncidentReport(incidentId: string, report: PostIncidentReportInput, officerId: string),
};
```

---

### 1A.3 Fire API Endpoints

Register in `apps/api/src/app.ts`:

```
POST   /v1/fire/:incidentId/report        Create/update fire report
POST   /v1/fire/:incidentId/dispatch      Dispatch fire units
PATCH  /v1/fire/units/:id/status          Update unit status + GPS
GET    /v1/fire/:incidentId/hydrants      Get nearest hydrants
GET    /v1/fire/:incidentId/weather       Get weather data for incident location
GET    /v1/fire/chemicals                 Search hazmat chemical reference
POST   /v1/fire/:incidentId/post-report   Submit post-incident report
GET    /v1/fire/units                     List all fire units for agency
GET    /v1/fire/units/available           Available units only
GET    /v1/fire/reports                   List post-incident reports (date filter)
```

---

### 1A.4 Hydrant Seed Data

Add to `apps/api/src/database/seed.ts` — seed 20 sample hydrants around Kigali:

```typescript
const hydrants = [
  { latitude: -1.9441, longitude: 30.0619, district: 'Gasabo', address: 'KG 11 Ave, near Kigali Convention Centre' },
  { latitude: -1.9536, longitude: 30.0606, district: 'Kicukiro', address: 'KK 15 Rd, near Kicukiro Centre' },
  { latitude: -1.9706, longitude: 30.1044, district: 'Nyarugenge', address: 'KN 3 Ave, near Nyabugogo' },
  // ... add 17 more spread across Kigali districts
];
```

---

### 1A.5 Hazmat Chemical Reference Guide

Create `apps/api/src/data/hazmat-guide.json` — a static reference file:

```json
[
  {
    "id": "LPG",
    "names": ["LPG", "Liquefied Petroleum Gas", "Propane", "Butane"],
    "hazardClass": "2.1 Flammable Gas",
    "hazmatLevel": "LEVEL_3",
    "protectiveEquipment": ["Full protective clothing", "Self-contained breathing apparatus (SCBA)", "Fire-resistant gloves"],
    "fireResponse": "Do not extinguish unless flow can be stopped. Cool containers with water spray. Keep people away from ends of tanks.",
    "evacuationRadiusMeters": 500,
    "waterReactive": false,
    "notes": "Common in Kigali households and restaurants. Check for cylinder markings."
  },
  {
    "id": "CHLORINE",
    "names": ["Chlorine", "Cl2", "Chlorine Gas"],
    "hazardClass": "2.3 Toxic Gas",
    "hazmatLevel": "LEVEL_4",
    "protectiveEquipment": ["Level A hazmat suit", "SCBA", "Chemical-resistant gloves and boots"],
    "fireResponse": "Do not use water directly on chlorine — creates hydrochloric acid. Use fog only. Neutralize with sodium carbonate.",
    "evacuationRadiusMeters": 1000,
    "waterReactive": true,
    "notes": "Used in water treatment plants. Evacuate downwind areas immediately."
  },
  {
    "id": "PETROL",
    "names": ["Petrol", "Gasoline", "Fuel", "Diesel"],
    "hazardClass": "3 Flammable Liquid",
    "hazmatLevel": "LEVEL_2",
    "protectiveEquipment": ["Turnout gear", "SCBA if vapors present", "Chemical-resistant gloves"],
    "fireResponse": "Use foam, CO2, or dry chemical extinguisher. Do not use water jet — spreads fire. Keep ignition sources away.",
    "evacuationRadiusMeters": 200,
    "waterReactive": false,
    "notes": "Most common at vehicle accidents. Watch for fuel tank rupture."
  }
]
```

Add at least 15 chemicals covering common Rwanda scenarios (LPG, petrol, chlorine, paint, industrial acids, etc.).

---

## Part 1B — Fire Dashboard Next.js App

### 1B.1 Setup

```bash
cp -r apps/dashboard-police apps/dashboard-fire
cd apps/dashboard-fire

# Update .env.local
NEXT_PUBLIC_AGENCY_TYPE=FIRE
NEXT_PUBLIC_APP_NAME=Rwanda Safe — Fire Brigade Dashboard
NEXT_PUBLIC_OPENWEATHER_KEY=your_openweathermap_key
```

### 1B.2 Fire Theme

```typescript
export const FireTheme = {
  sidebar:        '#1A0800',   // Very dark burnt orange/black
  sidebarActive:  '#7C2D12',
  topbar:         '#FFFFFF',
  background:     '#FFF7ED',
  surface:        '#FFFFFF',
  border:         '#FED7AA',
  primary:        '#EA580C',   // Fire orange
  primaryHover:   '#C2410C',

  // Fire unit status
  unitAvailable:  '#22C55E',
  unitResponding: '#F59E0B',
  unitOnScene:    '#EF4444',
  unitReturning:  '#8B5CF6',

  // Hazmat levels
  hazmatLevel1:   '#22C55E',
  hazmatLevel2:   '#F59E0B',
  hazmatLevel3:   '#EF4444',
  hazmatLevel4:   '#7C3AED',  // Purple = extreme danger
};
```

### 1B.3 New Components to Build

**`incidents/FireReportPanel.tsx`**
```typescript
/**
 * Shown in incident detail drawer for fire incidents.
 * Fields to set/update:
 *   Fire type selector (8 type buttons with icons)
 *   Hazmat level (4 colored buttons — only shown if type is CHEMICAL_SPILL or GAS_LEAK)
 *   Chemical name input (with autocomplete from hazmat guide)
 *   Building type (House/Apartment/Commercial/Industrial/Vehicle/Other)
 *   Building floors (number input)
 *   Estimated occupancy (number input)
 *   Casualties reported (number input)
 *
 * Below the form:
 *   WeatherPanel (auto-loads when incident is opened)
 *   NearestHydrantsPanel
 *   HazmatGuidePanel (only shown if chemical is set)
 */
```

**`fire/WeatherPanel.tsx`**
```typescript
/**
 * Shows real-time weather at the incident location.
 * Fetched from GET /v1/fire/:incidentId/weather
 *
 * Displays:
 *   🌡️ Temperature: 24°C
 *   💨 Wind: 18 km/h → NE (arrow icon rotated to wind direction)
 *   💧 Humidity: 65%
 *   ☁️ Conditions: Partly Cloudy
 *
 * Wind direction shown as an animated arrow icon.
 * Warning banner if wind speed > 30 km/h:
 *   "⚠️ High wind speed detected. Fire may spread rapidly to the NE."
 *
 * Shows a compass rose indicating wind direction relative to incident.
 * This tells crews which direction to position themselves (upwind).
 */
```

**`fire/NearestHydrantsPanel.tsx`**
```typescript
/**
 * Shows nearest hydrants to the incident.
 * Fetched from GET /v1/fire/:incidentId/hydrants
 *
 * List of up to 5 nearest hydrants:
 *   💧 KG 11 Ave (Gasabo) — 340m away — Operational ✅
 *   💧 KK 15 Rd (Kicukiro) — 820m away — Operational ✅
 *   💧 KN 3 Ave (Nyarugenge) — 1.2km away — ⚠️ Last checked 6 months ago
 *
 * "Show on Map" button — highlights hydrant markers on the dispatch map.
 */
```

**`fire/HazmatGuidePanel.tsx`**
```typescript
/**
 * Shows when a chemical is identified on the fire report.
 * Fetched from GET /v1/fire/chemicals?q={chemicalName}
 *
 * Displays:
 *   🧪 Chemical: LPG (Liquefied Petroleum Gas)
 *   ⚠️ Hazard Class: 2.1 Flammable Gas
 *   🟡 Hazmat Level: LEVEL 3
 *   🧤 Required Equipment: [list of PPE items as chips]
 *   🚒 Fire Response: [detailed text]
 *   📏 Evacuation Radius: 500m
 *   💧 Water Reactive: NO
 *
 * Evacuation radius shown as a circle on the incident map.
 * "Share with Crew" button — copies guide text to clipboard.
 */
```

**`fire/FireUnitDispatchPanel.tsx`**
```typescript
/**
 * Similar to AmbulanceDispatchPanel but for fire units.
 * Shows available fire units with:
 *   - Call sign + unit type (Fire Truck / Ladder / Rescue / Hazmat)
 *   - Water capacity (liters)
 *   - Has hazmat kit (checkbox)
 *   - Crew count
 *   - Distance from incident
 *
 * For CHEMICAL_SPILL or hazmatLevel 3+:
 *   Highlights HAZMAT_UNIT first in the list.
 *   Shows warning if no hazmat unit is available.
 *
 * Supports multi-select — can dispatch multiple units at once.
 */
```

**`fire/PostIncidentReportModal.tsx`**
```typescript
/**
 * Available when incident status is RESOLVED or ON_SCENE.
 * Form fields:
 *   Final fire type (auto-filled from fire report)
 *   Cause of fire (suspected) — dropdown
 *   Was fire contained? Yes/No
 *   Casualties: (injuries, fatalities — number inputs)
 *   Property damage estimate (Low/Moderate/Severe/Total Loss)
 *   Narrative (textarea — what happened, response taken, outcome)
 *   Lessons learned (optional textarea)
 *
 * On submit: calls POST /v1/fire/:incidentId/post-report
 * After submit: incident status changes to CLOSED.
 * "Download Report" button appears after submission.
 */
```

### 1B.4 Screen Specifications

#### `app/dashboard/page.tsx` — Fire Overview

**5 Stat Cards:**
| Card | Value | Color |
|---|---|---|
| Active Fire Incidents | count | Orange |
| Units Deployed | `X / Y total` | Red |
| Hazmat Incidents Today | count | Purple |
| Avg Response Time | minutes | Yellow |
| Post-Reports Pending | count | Grey |

**Live Feed:** Shows FIRE incidents only. Each row shows fire type icon instead of generic type.

**Units Status Panel (right 35%):**
- Grid of unit cards: each showing call sign, status, current assignment
- Color by status: green=available, yellow=responding, red=on scene

**Weather Summary (bottom):**
- Current weather across Kigali districts (3 cards: city center, south, east)
- Wind advisory banner if wind > 30 km/h anywhere in Kigali

---

#### `app/dashboard/dispatch/page.tsx` — Fire Dispatch Map

**Left panel (40%) — Unit Fleet:**
All fire units as cards with status, water capacity, crew count.

**Right panel (60%) — Map:**
- Fire incident pins (flame icon, colored by severity)
- Unit locations (fire truck icon, animated when RESPONDING)
- **Hydrant layer** (blue water drop icons — toggleable)
- **Evacuation radius circles** for hazmat incidents (colored rings)
- **Wind direction overlay** — animated arrows showing wind direction across the map
- Route lines from responding units to their incidents

---

#### `app/dashboard/hazmat/page.tsx` — Hazmat Reference Guide

Search page for the chemical reference guide.

- Search bar: "Search chemical name..."
- Results show as cards with hazmat level color coding
- Click a chemical → full detail panel
- "Print Guide" button for field use
- Recently used chemicals shown at top

---

#### `app/dashboard/reports/page.tsx` — Post-Incident Reports

Table of all submitted post-incident reports.
- Filter by: date range, fire type, district
- Click row → view full report
- "Export PDF" button for any report
- Status indicator: reports pending submission highlighted in orange

---

---

## PART 2 — RIB DASHBOARD (Rwanda Investigation Bureau)

---

## Part 2A — Backend: Investigation API

### 2A.1 New Prisma Models

Add to `apps/api/prisma/schema.prisma`:

```prisma
enum InvestigationStatus {
  OPEN
  ACTIVE
  SUSPENDED
  CLOSED_SOLVED
  CLOSED_UNSOLVED
  REFERRED
}

enum EvidenceType {
  PHOTO
  VIDEO
  DOCUMENT
  AUDIO
  PHYSICAL_DESCRIPTION
  WITNESS_STATEMENT
  OTHER
}

enum SuspectStatus {
  PERSON_OF_INTEREST
  SUSPECT
  CHARGED
  ACQUITTED
  CONVICTED
}

model Investigation {
  id              String                @id @default(uuid())
  caseNumber      String                @unique @map("case_number")
  incidentId      String?               @map("incident_id")
  title           String
  description     String
  status          InvestigationStatus   @default(OPEN)
  leadInvestigatorId String?            @map("lead_investigator_id")
  agencyId        String                @map("agency_id")
  classificationLevel String            @default("STANDARD") @map("classification_level")
  isSensitive     Boolean               @default(false) @map("is_sensitive")
  openedAt        DateTime              @default(now()) @map("opened_at")
  closedAt        DateTime?             @map("closed_at")
  closureNote     String?               @map("closure_note")
  createdAt       DateTime              @default(now()) @map("created_at")
  updatedAt       DateTime              @updatedAt @map("updated_at")

  incident        Incident?             @relation(fields: [incidentId], references: [id])
  leadInvestigator Officer?             @relation(fields: [leadInvestigatorId], references: [id])
  agency          Agency                @relation(fields: [agencyId], references: [id])
  suspects        Suspect[]
  evidence        InvestigationEvidence[]
  linkedCases     Investigation[]       @relation("LinkedCases")
  linkedTo        Investigation[]       @relation("LinkedCases")
  tips            Tip[]

  @@map("investigations")
}

model Suspect {
  id                String          @id @default(uuid())
  investigationId   String          @map("investigation_id")
  alias             String?
  description       String?
  age               Int?
  gender            String?
  nationality       String?
  knownAddresses    String[]        @map("known_addresses")
  status            SuspectStatus   @default(PERSON_OF_INTEREST)
  notes             String?
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")

  investigation     Investigation   @relation(fields: [investigationId], references: [id], onDelete: Cascade)
  evidence          InvestigationEvidence[]

  @@map("suspects")
}

model InvestigationEvidence {
  id                String        @id @default(uuid())
  investigationId   String        @map("investigation_id")
  suspectId         String?       @map("suspect_id")
  type              EvidenceType
  title             String
  description       String?
  fileUrl           String?       @map("file_url")
  filePublicId      String?       @map("file_public_id")
  collectedAt       DateTime?     @map("collected_at")
  collectedById     String?       @map("collected_by_id")
  chainOfCustody    Json?         @map("chain_of_custody")
  isAdmissible      Boolean       @default(true) @map("is_admissible")
  createdAt         DateTime      @default(now()) @map("created_at")

  investigation     Investigation @relation(fields: [investigationId], references: [id], onDelete: Cascade)
  suspect           Suspect?      @relation(fields: [suspectId], references: [id])

  @@map("investigation_evidence")
}

model Tip {
  id              String    @id @default(uuid())
  investigationId String?   @map("investigation_id")
  content         String
  submitterPhone  String?   @map("submitter_phone")
  isAnonymous     Boolean   @default(true) @map("is_anonymous")
  isReviewed      Boolean   @default(false) @map("is_reviewed")
  isCredible      Boolean?  @map("is_credible")
  reviewedById    String?   @map("reviewed_by_id")
  reviewNotes     String?   @map("review_notes")
  createdAt       DateTime  @default(now()) @map("created_at")

  investigation   Investigation? @relation(fields: [investigationId], references: [id])

  @@map("tips")
}

model PatternAlert {
  id              String    @id @default(uuid())
  title           String
  description     String
  incidentType    String    @map("incident_type")
  district        String
  incidentCount   Int       @map("incident_count")
  timeWindowHours Int       @map("time_window_hours")
  incidentIds     String[]  @map("incident_ids")
  isReviewed      Boolean   @default(false) @map("is_reviewed")
  reviewedById    String?   @map("reviewed_by_id")
  createdAt       DateTime  @default(now()) @map("created_at")

  @@map("pattern_alerts")
}
```

Add relations:
- `Incident`: add `investigation Investigation?`
- `Agency`: add `investigations Investigation[]`
- `Officer`: add `ledInvestigations Investigation[]`

Run migration:
```bash
cd apps/api && npx prisma migrate dev --name add_rib_models
```

---

### 2A.2 Investigation Service

Create `apps/api/src/modules/investigation/investigation.service.ts`:

```typescript
export const investigationService = {

  /**
   * Creates a new investigation.
   * Auto-generates case number: RIB-YYYY-NNNNN
   * Links to an incident if incidentId is provided (escalated from police).
   * Sets leadInvestigator if provided.
   */
  async createInvestigation(data: CreateInvestigationInput, createdById: string),

  /**
   * Links multiple incident IDs to one investigation.
   * Used when a pattern is detected — multiple reports form one case.
   * Adds internal note to each linked incident: "Linked to investigation [caseNumber]"
   */
  async linkIncidents(investigationId: string, incidentIds: string[]),

  /**
   * Links two investigations together (e.g. same suspect, related crimes).
   */
  async linkInvestigations(investigationId: string, linkedInvestigationId: string),

  /**
   * Adds a suspect to an investigation.
   */
  async addSuspect(investigationId: string, suspectData: SuspectInput),

  /**
   * Updates suspect status (PERSON_OF_INTEREST → SUSPECT → CHARGED etc).
   */
  async updateSuspectStatus(suspectId: string, status: SuspectStatus, notes: string),

  /**
   * Uploads evidence to the evidence vault.
   * Stores file in Supabase Storage under: rib-evidence/{investigationId}/{filename}
   * Records chain of custody: [{officer, timestamp, action: "UPLOADED"}]
   * Files in rib-evidence bucket are PRIVATE — signed URLs only, expire in 1 hour.
   */
  async uploadEvidence(investigationId: string, file: Express.Multer.File, data: EvidenceInput, uploadedById: string),

  /**
   * Returns a signed URL for a private evidence file.
   * URL expires in 1 hour.
   * Logs access to chain of custody.
   */
  async getEvidenceSignedUrl(evidenceId: string, requestedById: string),

  /**
   * Runs pattern detection across recent incidents.
   * Algorithm:
   *   1. Group incidents by type + district in the last 72 hours
   *   2. If any group has 3+ incidents of the same type in the same district:
   *      → Create a PatternAlert
   *      → Emit "pattern:alert" Socket.io event to RIB agency room
   *   3. Return list of new alerts created
   * This function should be called:
   *   - Every time a new incident is created (from incidentsService.createIncident)
   *   - Via a scheduled cron job every 6 hours
   */
  async runPatternDetection(),

  /**
   * Generates a court-ready PDF case export.
   * Includes:
   *   Cover page: case number, title, classification, dates
   *   Section 1: Case summary
   *   Section 2: Linked incidents (list with dates, descriptions)
   *   Section 3: Evidence log (title, type, date collected, chain of custody)
   *   Section 4: Suspects (description, status, linked evidence)
   *   Section 5: Investigation timeline (all status changes + notes)
   *   Footer: "CONFIDENTIAL — Rwanda Investigation Bureau"
   * Uses the pdfkit or pdf-lib library.
   * Returns: PDF buffer (sent as download response).
   */
  async exportCasePdf(investigationId: string, requestedById: string),

  /**
   * Closes an investigation with a resolution note.
   * Status options: CLOSED_SOLVED or CLOSED_UNSOLVED or REFERRED.
   * If REFERRED: requires a target agency name and case handoff note.
   */
  async closeInvestigation(investigationId: string, status: InvestigationStatus, note: string, closedById: string),
};
```

---

### 2A.3 Anonymous Tipline

Create `apps/api/src/modules/tipline/tipline.service.ts`:

```typescript
export const tiplineService = {

  /**
   * Receives an anonymous tip from the public tipline form.
   * NO authentication required for this endpoint.
   * NO IP address logged.
   * NO phone number required (truly anonymous).
   * Optional: submitter can provide a contact phone if they want follow-up.
   * Links to an existing investigation if investigationId is provided.
   */
  async submitTip(content: string, investigationId?: string, contactPhone?: string),

  /**
   * Returns all unreviewed tips for RIB investigators.
   * Sorted by createdAt DESC.
   */
  async getUnreviewedTips(page: number, limit: number),

  /**
   * Marks a tip as reviewed with credibility assessment.
   */
  async reviewTip(tipId: string, isCredible: boolean, notes: string, reviewedById: string),
};
```

---

### 2A.4 RIB API Endpoints

```
# Investigations
POST   /v1/investigations                      Create new investigation
GET    /v1/investigations                      List investigations (with filters)
GET    /v1/investigations/:id                  Get investigation detail
PATCH  /v1/investigations/:id/status           Update investigation status
POST   /v1/investigations/:id/link-incidents   Link incidents to case
POST   /v1/investigations/:id/link-case        Link two investigations
POST   /v1/investigations/:id/close            Close investigation

# Suspects
POST   /v1/investigations/:id/suspects         Add suspect
PATCH  /v1/suspects/:id/status                 Update suspect status

# Evidence
POST   /v1/investigations/:id/evidence         Upload evidence file
GET    /v1/investigations/:id/evidence         List evidence
GET    /v1/evidence/:id/url                    Get signed URL for evidence file

# Pattern Detection
GET    /v1/patterns/alerts                     Get unreviewed pattern alerts
PATCH  /v1/patterns/:id/review                 Mark alert as reviewed
POST   /v1/patterns/run                        Manually trigger pattern detection

# Tipline (PUBLIC — no auth)
POST   /v1/tips                                Submit anonymous tip
# Tipline management (RIB auth required)
GET    /v1/tips                                List tips for review
PATCH  /v1/tips/:id/review                     Review a tip

# Export
GET    /v1/investigations/:id/export-pdf       Download case as PDF
```

---

## Part 2B — RIB Dashboard Next.js App

### 2B.1 Setup

```bash
cp -r apps/dashboard-police apps/dashboard-rib
cd apps/dashboard-rib

NEXT_PUBLIC_AGENCY_TYPE=RIB
NEXT_PUBLIC_APP_NAME=Rwanda Safe — RIB Investigation Dashboard
```

### 2B.2 RIB Theme

```typescript
export const RIBTheme = {
  sidebar:        '#0A0A1A',   // Very dark navy/black
  sidebarActive:  '#1E1B4B',
  topbar:         '#FFFFFF',
  background:     '#F5F3FF',
  surface:        '#FFFFFF',
  border:         '#DDD6FE',
  primary:        '#4C1D95',   // Deep purple
  primaryHover:   '#3B0764',

  // Investigation status
  statusOpen:         '#3B82F6',
  statusActive:       '#8B5CF6',
  statusSuspended:    '#6B7280',
  statusClosedSolved: '#22C55E',
  statusClosedUnsolved: '#EF4444',
  statusReferred:     '#F59E0B',

  // Suspect status
  suspectPOI:       '#F59E0B',
  suspectSuspect:   '#EF4444',
  suspectCharged:   '#8B5CF6',
  suspectAcquitted: '#6B7280',
  suspectConvicted: '#DC2626',

  // Evidence types
  evidencePhoto:    '#3B82F6',
  evidenceVideo:    '#8B5CF6',
  evidenceDocument: '#10B981',
  evidenceAudio:    '#F59E0B',
};
```

### 2B.3 New Components to Build

**`investigations/InvestigationCard.tsx`**
```typescript
/**
 * Card for the investigations list.
 * Shows: case number, title, status badge,
 * lead investigator, linked incidents count,
 * suspects count, evidence count, opened date, last updated.
 * Click → opens investigation detail page.
 */
```

**`investigations/InvestigationDetail.tsx`**
```typescript
/**
 * Full investigation detail view (full page, not a drawer).
 * Sections (as tabs):
 *   Overview | Suspects | Evidence Vault | Timeline | Tips | Export
 */
```

**`investigations/SuspectPanel.tsx`**
```typescript
/**
 * Lists all suspects on an investigation.
 * Each suspect card shows: alias/description, age, gender, status badge.
 * "Update Status" button → shows status transition dropdown.
 * "Add Suspect" button → opens form.
 * "Link Evidence" button → select evidence items to link to this suspect.
 */
```

**`investigations/EvidenceVault.tsx`**
```typescript
/**
 * Secure evidence vault for an investigation.
 *
 * Grid of evidence items:
 *   Photo: thumbnail with lock icon overlay (click → generates signed URL → opens in new tab)
 *   Video: video thumbnail with play icon + lock
 *   Document: PDF icon + title + lock
 *   Audio: waveform icon + lock
 *
 * Upload button: opens file picker (any file type).
 * For each item: title, type, collected date, collected by, is admissible toggle.
 *
 * Chain of custody accordion: shows full access log for each file.
 *
 * ⚠️ SECURITY NOTE: Evidence files are NEVER shown with a permanent public URL.
 * Always use signed URLs that expire in 1 hour (GET /v1/evidence/:id/url).
 */
```

**`investigations/PatternAlertBanner.tsx`**
```typescript
/**
 * Shown at top of RIB dashboard when new pattern alerts exist.
 * "⚠️ 2 new pattern alerts detected. Review them."
 * Click → opens pattern alerts page.
 * Received via Socket.io "pattern:alert" event.
 */
```

**`investigations/CaseTimeline.tsx`**
```typescript
/**
 * Full timeline of an investigation.
 * Each entry shows: date, officer name, action, note.
 * Actions: Case Opened, Status Changed, Suspect Added,
 *   Evidence Uploaded, Incident Linked, Note Added, Case Closed.
 * "Add Note" button at bottom.
 */
```

**`investigations/LinkIncidentsModal.tsx`**
```typescript
/**
 * Modal to link existing incidents to an investigation.
 * Search bar: search incidents by tracking code or description.
 * Results: list of matching incidents with checkboxes.
 * Already-linked incidents shown greyed out.
 * "Link Selected" button → calls POST /v1/investigations/:id/link-incidents.
 */
```

**`tipline/TipReviewPanel.tsx`**
```typescript
/**
 * Panel for reviewing incoming tips.
 * Each tip card:
 *   Submission date + time
 *   Content (full text)
 *   Contact phone (if provided) — shown as masked: +250788***456
 *   Anonymous badge if no contact
 *   Linked investigation (if any)
 *   Buttons: "Mark Credible" (green) | "Mark Not Credible" (red) | "Link to Case"
 */
```

### 2B.4 Screen Specifications

#### `app/dashboard/page.tsx` — RIB Overview

**5 Stat Cards:**
| Card | Value | Color |
|---|---|---|
| Open Investigations | count | Purple |
| Active Investigations | count | Blue |
| Unreviewed Tips | count + pulsing dot | Orange |
| Pattern Alerts | count | Red |
| Cases Closed This Month | count | Green |

**Recent Investigations list (left 65%):**
- Latest 8 investigations as cards
- Click → goes to investigation detail page

**Pattern Alerts Panel (right 35%):**
- List of unreviewed pattern alerts
- Each: incident type, district, count, time window
- "Review" button per alert

---

#### `app/dashboard/investigations/page.tsx` — Investigations List

**Filters:**
- Status dropdown (Open / Active / Suspended / Closed)
- Type (crime category)
- Investigator
- Date range
- Sensitive cases toggle (only admin sees these)

**Table columns:**
| Column | Details |
|---|---|
| Case Number | RIB-2026-00001 — monospace, clickable |
| Title | First 60 chars |
| Status | Colored badge |
| Lead Investigator | Name |
| Linked Incidents | Count |
| Suspects | Count |
| Evidence | Count |
| Opened | Date |
| Updated | Time ago |

Click row → `/dashboard/investigations/:id`

---

#### `app/dashboard/investigations/[id]/page.tsx` — Investigation Detail

Full-page layout with tabs:

**Tab 1 — Overview:**
- Case number, title, status, classification
- Description (editable)
- Linked incidents: list of incident cards (tracking code + type + status)
- Linked investigations: list with case numbers
- Lead investigator (reassignable)
- "Close Case" button (opens closure modal)

**Tab 2 — Suspects:**
`SuspectPanel` component.

**Tab 3 — Evidence Vault:**
`EvidenceVault` component.

**Tab 4 — Timeline:**
`CaseTimeline` component.

**Tab 5 — Tips:**
Tips linked to this investigation.
`TipReviewPanel` component.

**Tab 6 — Export:**
- "Generate Court-Ready PDF" button
- Preview of what will be in the PDF
- Download button (calls GET /v1/investigations/:id/export-pdf)
- "Share with INTERPOL" button (generates a sanitized summary — removes all personal details)

---

#### `app/dashboard/tips/page.tsx` — Tipline Management

Two sections:

**Unreviewed Tips (top):**
`TipReviewPanel` list. Count badge on tab shows unreviewed count.

**Reviewed Tips (bottom, collapsible):**
Credible tips | Non-credible tips (separate tabs).

---

#### `app/dashboard/patterns/page.tsx` — Pattern Detection

**How pattern detection works (explain in the UI):**
Small info box: "Pattern alerts are generated when 3+ incidents of the same type occur in the same district within 72 hours."

**Alert cards:**
```
🔴 Pattern Alert — CRIME — Gasabo District
   5 incidents in 72 hours (2× robbery, 3× assault)
   First incident: RW-2026-00401
   Last incident:  RW-2026-00418
   Time span: 61 hours
   [View All Incidents] [Open Investigation] [Dismiss]
```

"Open Investigation" → pre-fills a new investigation form with all linked incident IDs.

**Manual trigger:**
"Run Pattern Detection Now" button → calls POST /v1/patterns/run → shows results.

---

#### Public Tipline Page (Citizen-facing)

Create a separate standalone page in `apps/web-citizen/src/app/tip/page.tsx`:

This is the **public encrypted tipline** — no login required.

```
[Rwanda Safe Logo]

"Submit an Anonymous Tip"
"Your identity is completely protected. No login required. 
 No IP address is recorded."

Category:
  ○ Serious Crime  ○ Corruption  ○ GBV  ○ Missing Person  ○ Other

Your tip:
[Large textarea — min 20 characters]

Case reference (optional):
[Input — enter a case number if you know it]

Contact for follow-up (optional):
[Phone number — only if you want to be contacted]

[Submit Anonymously]
```

After submit: "Thank you. Your tip has been received securely by the Rwanda Investigation Bureau."

---

## Part 3 — Backend Tests

### Fire Tests (`apps/api/src/modules/fire/fire.test.ts`)
1. `POST /v1/fire/:incidentId/report` — creates FireReport with correct fire type
2. `POST /v1/fire/:incidentId/dispatch` — dispatches unit, sets status to RESPONDING
3. `POST /v1/fire/:incidentId/dispatch` — fails if unit is already RESPONDING (400)
4. `GET /v1/fire/:incidentId/hydrants` — returns hydrants sorted by distance
5. `GET /v1/fire/chemicals?q=LPG` — returns matching chemical guide entry
6. `POST /v1/fire/:incidentId/post-report` — saves report, changes incident status to CLOSED

### RIB Tests (`apps/api/src/modules/investigation/investigation.test.ts`)
1. `POST /v1/investigations` — creates investigation with unique case number RIB-YYYY-NNNNN
2. `POST /v1/investigations/:id/link-incidents` — links incidents, adds note to each
3. `POST /v1/investigations/:id/suspects` — adds suspect to investigation
4. `POST /v1/investigations/:id/evidence` — uploads file, creates evidence record with chain of custody
5. `GET /v1/evidence/:id/url` — returns signed URL (not permanent public URL)
6. Pattern detection: creates PatternAlert when 3+ CRIME incidents in same district within 72h
7. `POST /v1/tips` — no auth required, creates tip record with no IP stored
8. `GET /v1/investigations/:id/export-pdf` — returns PDF buffer with correct headers

---

## Definition of Done for Chapter 5

**Fire Backend**
- [ ] All fire models migrated to Supabase
- [ ] Hydrant seed data inserted (20 hydrants in Kigali)
- [ ] Hazmat guide JSON file included with 15+ chemicals
- [ ] `POST /v1/fire/:incidentId/dispatch` dispatches units and emits Socket.io event
- [ ] `GET /v1/fire/:incidentId/weather` returns live weather from OpenWeatherMap
- [ ] All 6 fire tests pass

**Fire Dashboard**
- [ ] Runs on port 3003
- [ ] Live feed shows only FIRE incidents
- [ ] WeatherPanel shows wind speed and direction with warning if > 30 km/h
- [ ] NearestHydrantsPanel shows hydrants sorted by distance
- [ ] HazmatGuidePanel shows chemical details + evacuation radius
- [ ] Hazmat evacuation radius drawn as circle on dispatch map
- [ ] Post-incident report form submits and closes the incident
- [ ] Fire unit dispatch supports multi-unit selection

**RIB Backend**
- [ ] All RIB models migrated to Supabase
- [ ] `POST /v1/tips` works with NO authentication
- [ ] Pattern detection creates PatternAlert for 3+ same-type incidents in 72h
- [ ] Evidence signed URLs expire after 1 hour
- [ ] `GET /v1/investigations/:id/export-pdf` returns downloadable PDF
- [ ] All 8 RIB tests pass

**RIB Dashboard**
- [ ] Runs on port 3004
- [ ] Investigations list with filters works correctly
- [ ] Investigation detail page has all 6 tabs working
- [ ] Evidence vault shows lock icon — clicking generates signed URL
- [ ] Chain of custody log shows access history per file
- [ ] Pattern alerts appear in real-time via Socket.io
- [ ] "Open Investigation" from pattern alert pre-fills incident IDs
- [ ] Court-ready PDF downloads with all sections
- [ ] Anonymous tipline public page works without any login

**Integration**
- [ ] Police officer forwards a CRIME case to RIB via ForwardModal
- [ ] RIB dashboard receives it as a new escalated incident
- [ ] RIB investigator creates an investigation linked to that incident
- [ ] Pattern detection auto-fires when a 3rd CRIME incident hits Gasabo within 72h
- [ ] Anonymous tip submitted from public page appears in RIB tipline page

---

## Notes for Developer

- Fire dashboard runs on port **3003**, RIB dashboard on port **3004**
- OpenWeatherMap free API key: register at openweathermap.org — free tier allows 1,000 calls/day which is more than enough
- For PDF generation use `pdfkit` (simpler) or `@react-pdf/renderer` (React-based, better formatting): `npm install pdfkit` or `npm install @react-pdf/renderer`
- The evidence vault Supabase Storage bucket must be set to **PRIVATE** (not public). Use `supabase.storage.from('rib-evidence').createSignedUrl(path, 3600)` for 1-hour signed URLs
- Pattern detection should NOT run on every API request in production — it's expensive. Call it from `incidentsService.createIncident` only for the affected district, not a full scan
- The public tipline at `/tip` in web-citizen must be listed in the navigation footer so citizens can find it
- Never log the submitter's IP address in the tipline endpoint — add a comment in the code explicitly noting this for auditability
- Refer to Rwanda Safe SSD v1.0, Chapters 7 & 8 for full Fire and RIB feature specifications

---

*End of Chapter 5 Developer Prompt — Rwanda Safe v1.0*
