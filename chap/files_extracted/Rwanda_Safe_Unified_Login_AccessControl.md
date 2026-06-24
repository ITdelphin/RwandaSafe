# Rwanda Safe — Developer Prompt: Unified Dashboard Login + Super Admin Access Control

> **Purpose:** Replace the 5 separate dashboard login pages (Police, Hospital, Fire, RIB, Admin) with ONE shared login portal. After login, the officer is routed to whichever dashboard(s) they have access to. The Super Admin controls who gets access to which dashboard, and every admin gets a Settings page.

---

## What This Changes

**Before:** Each dashboard (`dashboard-police`, `dashboard-hospital`, etc.) had its own separate login page and only checked "is this user's role correct for this specific dashboard."

**After:** One login portal at a shared URL. After authenticating, the system checks **which agencies/dashboards this specific officer has been granted access to** (set by Super Admin), and:
- If they have access to exactly 1 dashboard → redirect straight there
- If they have access to multiple dashboards → show a dashboard picker screen
- If they have no access → show "Contact your administrator" message

Super Admin can grant a single officer access to **multiple dashboards** (e.g. someone who works across both Police and RIB).

---

## Part A — Backend: Access Control Model

### A1. New Prisma Model — DashboardAccess

Add to `apps/api/prisma/schema.prisma`:

```prisma
enum DashboardType {
  POLICE
  HOSPITAL
  FIRE
  RIB
  ADMIN
}

model DashboardAccess {
  id            String        @id @default(uuid())
  userId        String        @map("user_id")
  dashboard     DashboardType
  grantedById   String        @map("granted_by_id")
  isActive      Boolean       @default(true) @map("is_active")
  grantedAt     DateTime      @default(now()) @map("granted_at")
  revokedAt     DateTime?     @map("revoked_at")

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, dashboard])
  @@map("dashboard_access")
}
```

Add relation to `User` model:
```prisma
dashboardAccess  DashboardAccess[]
```

Run migration:
```bash
cd apps/api && npx prisma migrate dev --name add_dashboard_access
```

### A2. Seed Default Access

Update `apps/api/src/database/seed.ts` — when creating the initial officer accounts and the Super Admin, also grant matching dashboard access:

```typescript
// When seeding the Super Admin user:
const superAdmin = await prisma.user.create({
  data: { phone: '+250788000001', name: 'System Administrator', role: 'SUPER_ADMIN', isVerified: true },
});

// Super Admin automatically gets ALL dashboard access
for (const dashboard of ['POLICE', 'HOSPITAL', 'FIRE', 'RIB', 'ADMIN'] as const) {
  await prisma.dashboardAccess.create({
    data: { userId: superAdmin.id, dashboard, grantedById: superAdmin.id },
  });
}

// When seeding each agency's first officer, grant them access to their own dashboard only:
await prisma.dashboardAccess.create({
  data: { userId: policeOfficerUser.id, dashboard: 'POLICE', grantedById: superAdmin.id },
});
```

### A3. Access Service

Create `apps/api/src/modules/access/access.service.ts`:

```typescript
import { prisma } from '../../config/database';
import { DashboardType, Role } from '@prisma/client';
import { socketEmit } from '../../socket/socket';
import { notificationsService } from '../notifications/notifications.service';

export const accessService = {

  /**
   * Returns the list of dashboards a user currently has active access to.
   * Used right after login to decide where to route the officer.
   */
  async getUserDashboardAccess(userId: string): Promise<DashboardType[]> {
    const access = await prisma.dashboardAccess.findMany({
      where: { userId, isActive: true },
      select: { dashboard: true },
    });
    return access.map(a => a.dashboard);
  },

  /**
   * Grants a user access to a specific dashboard.
   * Only callable by SUPER_ADMIN.
   * If access already exists but was revoked, reactivates it.
   * Sends notification to the officer: "You now have access to the [X] dashboard."
   */
  async grantAccess(userId: string, dashboard: DashboardType, grantedById: string) {
    const existing = await prisma.dashboardAccess.findUnique({
      where: { userId_dashboard: { userId, dashboard } },
    });

    let access;
    if (existing) {
      access = await prisma.dashboardAccess.update({
        where: { id: existing.id },
        data: { isActive: true, grantedById, grantedAt: new Date(), revokedAt: null },
      });
    } else {
      access = await prisma.dashboardAccess.create({
        data: { userId, dashboard, grantedById },
      });
    }

    await notificationsService.send({
      userId,
      type: 'SYSTEM',
      title: 'Dashboard Access Granted',
      body: `You now have access to the ${dashboard} dashboard.`,
    });

    return access;
  },

  /**
   * Revokes a user's access to a specific dashboard.
   * Only callable by SUPER_ADMIN.
   * Cannot revoke a SUPER_ADMIN's own ADMIN access (safety check).
   */
  async revokeAccess(userId: string, dashboard: DashboardType, revokedById: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === 'SUPER_ADMIN' && dashboard === 'ADMIN' && userId === revokedById) {
      throw new Error('Cannot revoke your own admin access');
    }

    await prisma.dashboardAccess.updateMany({
      where: { userId, dashboard },
      data: { isActive: false, revokedAt: new Date() },
    });

    await notificationsService.send({
      userId,
      type: 'SYSTEM',
      title: 'Dashboard Access Revoked',
      body: `Your access to the ${dashboard} dashboard has been removed.`,
    });
  },

  /**
   * Returns all users and their current dashboard access — for the admin access management screen.
   * Includes: user name, phone/email, role, agency, list of granted dashboards.
   */
  async listAllAccess(filters: { dashboard?: DashboardType; role?: Role }) {
    return prisma.user.findMany({
      where: {
        role: { not: 'CITIZEN' },
        ...(filters.role && { role: filters.role }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        dashboardAccess: {
          where: { isActive: true },
          select: { dashboard: true, grantedAt: true },
        },
      },
    });
  },

  /**
   * Bulk grant — give a user access to multiple dashboards at once.
   * Used when creating a new officer account who works across agencies.
   */
  async grantMultipleAccess(userId: string, dashboards: DashboardType[], grantedById: string) {
    const results = [];
    for (const dashboard of dashboards) {
      results.push(await this.grantAccess(userId, dashboard, grantedById));
    }
    return results;
  },
};
```

### A4. Access API Endpoints

Register in `apps/api/src/app.ts` — all require SUPER_ADMIN role except `/me`:

```
GET    /v1/access/me                    Get current user's dashboard access list
GET    /v1/access                       List all users + their access (admin only)
POST   /v1/access/grant                 Grant a user access to a dashboard
POST   /v1/access/grant-multiple        Grant a user access to multiple dashboards
DELETE /v1/access/revoke                Revoke a user's access to a dashboard
```

### A5. Update Login Flow

Update `apps/api/src/modules/auth/auth.service.ts` — after successful OTP verification for an officer (non-citizen role), include their dashboard access in the response:

```typescript
async verifyOfficerOtp(phone: string, code: string) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new Error('User not found');
  if (user.role === 'CITIZEN') throw new Error('This portal is for officers only');

  const isValid = await verifyOtp(user.id, code);
  if (!isValid) throw new Error('Invalid or expired code');

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = generateTokenPair(user);
  await this.storeRefreshToken(user.id, tokens.refreshToken);

  // NEW: include dashboard access in the response
  const dashboardAccess = await accessService.getUserDashboardAccess(user.id);

  return {
    ...tokens,
    user: this.toPublicUser(user),
    dashboardAccess,  // e.g. ["POLICE", "RIB"]
  };
}
```

### A6. Dashboard Guard Middleware

Create `apps/api/src/middleware/dashboardGuard.ts` — used by dashboard-scoped endpoints to verify the officer actually has access to the dashboard they're calling:

```typescript
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';
import { DashboardType } from '@prisma/client';

/**
 * Verifies the authenticated user has active access to the requested dashboard.
 * The dashboard type is read from a header: X-Dashboard-Type
 * (sent by each frontend app based on which dashboard it is).
 */
export async function dashboardGuard(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'SUPER_ADMIN') return next(); // Admin always passes

  const dashboardType = req.headers['x-dashboard-type'] as DashboardType;
  if (!dashboardType) return sendError(res, 'Missing dashboard type header', 400);

  const access = await prisma.dashboardAccess.findUnique({
    where: { userId_dashboard: { userId: req.user!.id, dashboard: dashboardType } },
  });

  if (!access || !access.isActive) {
    return sendError(res, `You do not have access to the ${dashboardType} dashboard`, 403);
  }

  next();
}
```

Apply to dashboard-scoped routers:
```typescript
app.use('/v1/dashboard', requireAuth, dashboardGuard, dashboardRouter);
app.use('/v1/medical', requireAuth, dashboardGuard, medicalRouter);
app.use('/v1/fire', requireAuth, dashboardGuard, fireRouter);
app.use('/v1/investigations', requireAuth, dashboardGuard, investigationRouter);
```

---

## Part B — Unified Login Portal (New App)

### B1. Why a Separate App

Instead of 5 separate login pages, build **one new small Next.js app**: `apps/portal`. This is the single entry point for ALL officers and admins.

```bash
npx create-next-app@latest apps/portal --typescript --tailwind --app --src-dir
cd apps/portal
npm install @tanstack/react-query axios zustand
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
NEXT_PUBLIC_POLICE_URL=http://localhost:3001
NEXT_PUBLIC_HOSPITAL_URL=http://localhost:3002
NEXT_PUBLIC_FIRE_URL=http://localhost:3003
NEXT_PUBLIC_RIB_URL=http://localhost:3004
NEXT_PUBLIC_ADMIN_URL=http://localhost:3005
```

In production, this becomes: `https://portal.rwandasafe.rw` or `rwanda-safe-portal.vercel.app`.

### B2. Folder Structure

```
apps/portal/src/
├── app/
│   ├── page.tsx              # Login page (phone + OTP)
│   ├── verify/page.tsx       # OTP verification
│   └── select/page.tsx       # Dashboard picker (if multiple access)
├── lib/
│   └── apiClient.ts
└── store/
    └── authStore.ts
```

### B3. `app/page.tsx` — Unified Login

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';

export default function PortalLoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSendOtp() {
    setLoading(true);
    try {
      await apiClient.post('/auth/officer/send', { phone });
      router.push(`/verify?phone=${encodeURIComponent(phone)}`);
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Rwanda Safe</h1>
          <p className="text-slate-500 mt-1">Authority Portal</p>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-1">
          Officer phone number
        </label>
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-2 bg-slate-100 rounded-lg text-slate-600">+250</span>
          <input
            type="tel"
            value={phone.replace('+250', '')}
            onChange={(e) => setPhone('+250' + e.target.value.replace(/\D/g, ''))}
            placeholder="788123456"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <button
          onClick={handleSendOtp}
          disabled={loading || phone.length < 12}
          className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>

        <p className="text-xs text-slate-400 text-center mt-6">
          This portal is for Police, Hospital, Fire, and RIB officers, and system administrators only.
          Citizens should use the Rwanda Safe mobile app.
        </p>
      </div>
    </div>
  );
}
```

### B4. `app/verify/page.tsx` — OTP + Routing Logic

This is the most important file — it handles the **routing decision** after login.

```tsx
'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

const DASHBOARD_URLS: Record<string, string> = {
  POLICE:   process.env.NEXT_PUBLIC_POLICE_URL!,
  HOSPITAL: process.env.NEXT_PUBLIC_HOSPITAL_URL!,
  FIRE:     process.env.NEXT_PUBLIC_FIRE_URL!,
  RIB:      process.env.NEXT_PUBLIC_RIB_URL!,
  ADMIN:    process.env.NEXT_PUBLIC_ADMIN_URL!,
};

export default function VerifyPage() {
  const phone = useSearchParams().get('phone')!;
  const [code, setCode] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleVerify() {
    try {
      const { data } = await apiClient.post('/auth/officer/verify', { phone, code });
      const { accessToken, refreshToken, user, dashboardAccess } = data.data;

      setAuth(user, accessToken, refreshToken, dashboardAccess);

      // ─── ROUTING DECISION ───
      if (dashboardAccess.length === 0) {
        router.push('/no-access');
      } else if (dashboardAccess.length === 1) {
        // Single dashboard access → redirect immediately, passing token via secure handoff
        redirectToDashboard(dashboardAccess[0], accessToken, refreshToken);
      } else {
        // Multiple dashboards → show picker
        router.push('/select');
      }
    } catch (err: any) {
      alert('Invalid code. Please try again.');
    }
  }

  function redirectToDashboard(dashboard: string, accessToken: string, refreshToken: string) {
    // Pass tokens via URL fragment (not query string, to avoid server logs) on first hop only.
    // The receiving dashboard app stores them in localStorage then immediately
    // clears the fragment from the URL bar.
    const url = DASHBOARD_URLS[dashboard];
    window.location.href = `${url}/auth/handoff#at=${accessToken}&rt=${refreshToken}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-1">Enter verification code</h2>
        <p className="text-slate-500 text-sm mb-6">Sent to {phone}</p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full text-center text-2xl tracking-widest border border-slate-300 rounded-lg py-3 mb-4"
          maxLength={6}
        />

        <button
          onClick={handleVerify}
          disabled={code.length !== 6}
          className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
        >
          Verify & Continue
        </button>
      </div>
    </div>
  );
}
```

### B5. `app/select/page.tsx` — Dashboard Picker (Multi-Access Officers)

```tsx
'use client';
import { useAuthStore } from '@/store/authStore';

const DASHBOARD_INFO: Record<string, { label: string; icon: string; color: string; url: string }> = {
  POLICE:   { label: 'Police Dashboard',   icon: '👮', color: 'bg-blue-700',   url: process.env.NEXT_PUBLIC_POLICE_URL! },
  HOSPITAL: { label: 'Hospital Dashboard', icon: '🏥', color: 'bg-red-700',    url: process.env.NEXT_PUBLIC_HOSPITAL_URL! },
  FIRE:     { label: 'Fire Brigade',       icon: '🚒', color: 'bg-orange-700', url: process.env.NEXT_PUBLIC_FIRE_URL! },
  RIB:      { label: 'RIB Investigation',  icon: '🔍', color: 'bg-purple-700', url: process.env.NEXT_PUBLIC_RIB_URL! },
  ADMIN:    { label: 'Admin Control Center', icon: '⚙️', color: 'bg-slate-800', url: process.env.NEXT_PUBLIC_ADMIN_URL! },
};

export default function SelectDashboardPage() {
  const { dashboardAccess, accessToken, refreshToken, user } = useAuthStore();

  function goTo(dashboard: string) {
    const info = DASHBOARD_INFO[dashboard];
    window.location.href = `${info.url}/auth/handoff#at=${accessToken}&rt=${refreshToken}`;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-1">Welcome, {user?.name}</h2>
        <p className="text-slate-500 text-sm mb-6">You have access to multiple dashboards. Choose one:</p>

        <div className="grid grid-cols-1 gap-3">
          {dashboardAccess.map((d) => {
            const info = DASHBOARD_INFO[d];
            return (
              <button
                key={d}
                onClick={() => goTo(d)}
                className={`${info.color} text-white rounded-lg p-4 flex items-center gap-3 hover:opacity-90 transition`}
              >
                <span className="text-2xl">{info.icon}</span>
                <span className="font-medium">{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### B6. Receiving the Handoff — Each Dashboard's `/auth/handoff` Page

Each of the 5 dashboards needs ONE new file to receive tokens from the portal:

Create in **each** dashboard app: `src/app/auth/handoff/page.tsx`:

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthHandoffPage() {
  const router = useRouter();

  useEffect(() => {
    // Read tokens from URL fragment (#at=...&rt=...)
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('at');
    const refreshToken = params.get('rt');

    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

      // Clear the fragment from the URL immediately (security)
      window.history.replaceState(null, '', window.location.pathname);

      router.replace('/dashboard');
    } else {
      router.replace('/'); // Back to portal if no token
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Signing you in...</p>
    </div>
  );
}
```

> **Security note:** Using URL fragments (`#`) instead of query params (`?`) means the tokens never appear in server access logs, browser history is cleared immediately via `history.replaceState`, and fragments are never sent to the server in the HTTP request line. This is a standard pattern for cross-app token handoff.

---

## Part C — Admin Access Management Screen (Super Admin Dashboard)

### C1. New Page: `app/dashboard/access/page.tsx`

Add this to `apps/dashboard-admin`:

```tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

const DASHBOARDS = ['POLICE', 'HOSPITAL', 'FIRE', 'RIB', 'ADMIN'] as const;

export default function AccessManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: users } = useQuery({
    queryKey: ['access-list'],
    queryFn: () => apiClient.get('/access').then(r => r.data.data),
  });

  const grantMutation = useMutation({
    mutationFn: ({ userId, dashboard }: any) =>
      apiClient.post('/access/grant', { userId, dashboard }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['access-list'] }),
  });

  const revokeMutation = useMutation({
    mutationFn: ({ userId, dashboard }: any) =>
      apiClient.delete('/access/revoke', { data: { userId, dashboard } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['access-list'] }),
  });

  const filteredUsers = users?.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Dashboard Access Management</h1>
      <p className="text-slate-500 mb-6">
        Control which officers can access which dashboards. Officers can be granted access to multiple dashboards.
      </p>

      <input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border border-slate-300 rounded-lg w-full max-w-sm"
      />

      <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Phone</th>
            <th className="text-left p-3">Role</th>
            {DASHBOARDS.map(d => (
              <th key={d} className="text-center p-3">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredUsers?.map((u: any) => {
            const activeDashboards = u.dashboardAccess.map((a: any) => a.dashboard);
            return (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{u.name ?? '—'}</td>
                <td className="p-3 text-slate-500">{u.phone}</td>
                <td className="p-3"><RoleBadge role={u.role} /></td>
                {DASHBOARDS.map(d => {
                  const hasAccess = activeDashboards.includes(d);
                  return (
                    <td key={d} className="text-center p-3">
                      <input
                        type="checkbox"
                        checked={hasAccess}
                        onChange={() => {
                          if (hasAccess) {
                            revokeMutation.mutate({ userId: u.id, dashboard: d });
                          } else {
                            grantMutation.mutate({ userId: u.id, dashboard: d });
                          }
                        }}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    POLICE_OFFICER: 'bg-blue-100 text-blue-700',
    MEDICAL_RESPONDER: 'bg-red-100 text-red-700',
    FIRE_OFFICER: 'bg-orange-100 text-orange-700',
    RIB_INVESTIGATOR: 'bg-purple-100 text-purple-700',
    SUPER_ADMIN: 'bg-slate-800 text-white',
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role] ?? ''}`}>{role}</span>;
}
```

Add to the admin sidebar navigation:
```
⚙️ Settings
  └── 🔐 Dashboard Access  → /dashboard/access
```

### C2. Add Audit Trail Visibility

Each grant/revoke action is already captured by the Chapter 6 `auditLogger` middleware automatically — no extra work needed, but add a quick link on the Access page:

```tsx
<Link href="/dashboard/audit?resourceType=access" className="text-sm text-blue-600 underline">
  View access change history →
</Link>
```

---

## Part D — Settings Page for ALL Admin/Officer Dashboards

Every dashboard (Police, Hospital, Fire, RIB, Admin) gets the **same Settings page** — built once, copied to each.

### D1. Settings Page Structure

Create `src/app/dashboard/settings/page.tsx` in **each** dashboard app:

```tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'notifications' | 'security' | 'access'>('profile');

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'security', label: 'Security' },
          { id: 'access', label: 'My Access' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === t.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'access' && <MyAccessTab />}
    </div>
  );
}
```

### D2. `ProfileTab` Component

```tsx
function ProfileTab() {
  const { user } = useAuthStore();
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => apiClient.get('/auth/me').then(r => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch('/auth/me', data),
  });

  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <input value={profile?.phone} disabled className="input bg-slate-50" />
        <p className="text-xs text-slate-400 mt-1">Phone number cannot be changed. Contact admin if needed.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email (optional)</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Badge Number</label>
        <input value={profile?.officer?.badgeNumber} disabled className="input bg-slate-50" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Rank</label>
        <input value={profile?.officer?.rank} disabled className="input bg-slate-50" />
      </div>
      <button
        onClick={() => updateMutation.mutate({ name, email })}
        className="bg-slate-900 text-white px-4 py-2 rounded-lg"
      >
        Save Changes
      </button>
    </div>
  );
}
```

### D3. `NotificationsTab` Component

Uses the Chapter 7 notification preferences endpoints:

```tsx
function NotificationsTab() {
  const { data: prefs } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: () => apiClient.get('/notifications/preferences').then(r => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch('/notifications/preferences', data),
  });

  return (
    <div className="space-y-4 max-w-md">
      <ToggleRow
        label="Push notifications"
        description="Receive alerts for new incidents and updates"
        checked={prefs?.pushEnabled}
        onChange={(v) => updateMutation.mutate({ pushEnabled: v })}
      />
      <ToggleRow
        label="SMS notifications"
        description="Receive SMS as a backup when push fails"
        checked={prefs?.smsEnabled}
        onChange={(v) => updateMutation.mutate({ smsEnabled: v })}
      />
      <ToggleRow
        label="Status update alerts"
        description="Notify me when a case status I'm assigned to changes"
        checked={prefs?.statusUpdates}
        onChange={(v) => updateMutation.mutate({ statusUpdates: v })}
      />
      <ToggleRow
        label="New message alerts"
        description="Notify me about new citizen messages"
        checked={prefs?.newMessages}
        onChange={(v) => updateMutation.mutate({ newMessages: v })}
      />
      <ToggleRow
        label="Broadcast alerts"
        description="Notify me about system-wide announcements"
        checked={prefs?.broadcastAlerts}
        onChange={(v) => updateMutation.mutate({ broadcastAlerts: v })}
      />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5"
      />
    </div>
  );
}
```

### D4. `SecurityTab` Component

```tsx
function SecurityTab() {
  const { logout } = useAuthStore();

  const logoutAllMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/logout-all'),
    onSuccess: () => logout(),
  });

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="font-medium mb-1">Active Sessions</h3>
        <p className="text-sm text-slate-500 mb-3">
          Sign out from all devices if you suspect unauthorized access.
        </p>
        <button
          onClick={() => logoutAllMutation.mutate()}
          className="text-red-600 border border-red-300 px-4 py-2 rounded-lg text-sm"
        >
          Sign out of all devices
        </button>
      </div>

      <div>
        <h3 className="font-medium mb-1">On-Duty Status</h3>
        <DutyToggle />
      </div>
    </div>
  );
}
```

### D5. `MyAccessTab` Component — Shows the officer's own access

```tsx
function MyAccessTab() {
  const { data: access } = useQuery({
    queryKey: ['my-access'],
    queryFn: () => apiClient.get('/access/me').then(r => r.data.data),
  });

  return (
    <div className="max-w-md">
      <h3 className="font-medium mb-3">Dashboards You Have Access To</h3>
      <div className="space-y-2">
        {access?.map((d: string) => (
          <div key={d} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <span className="text-green-600">✓</span>
            <span className="font-medium">{d}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4">
        Need access to another dashboard? Contact your system administrator.
      </p>
    </div>
  );
}
```

### D6. Add "Logout All Devices" Backend Endpoint

Add to `apps/api/src/modules/auth/auth.router.ts`:
```typescript
authRouter.post('/logout-all', requireAuth, authController.logoutAll);
```

Service method:
```typescript
async logoutAll(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
}
```

---

## Part E — Admin-Only Settings Additions (Super Admin Dashboard Only)

In `apps/dashboard-admin`, the Settings page gets ONE extra tab not present in other dashboards:

```tsx
// Add to the tab list in apps/dashboard-admin Settings page only:
{ id: 'system', label: 'System Configuration' },
```

```tsx
function SystemConfigTab() {
  const { data: configs } = useQuery({
    queryKey: ['system-configs'],
    queryFn: () => apiClient.get('/admin/config').then(r => r.data.data),
  });

  return (
    <div>
      <h3 className="font-medium mb-3">System-Wide Configuration</h3>
      <table className="w-full">
        <tbody>
          {configs?.map((c: any) => (
            <tr key={c.key} className="border-b border-slate-100">
              <td className="py-2 text-sm font-medium">{c.label}</td>
              <td className="py-2 text-sm text-slate-500">{c.category}</td>
              <td className="py-2"><InlineEditValue config={c} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

This links to the `SystemConfig` model and `/v1/admin/config` endpoints already built in Chapter 6.

---

## Part F — Backend Tests

Create `apps/api/src/modules/access/access.test.ts`:

```typescript
describe('Dashboard Access Control', () => {
  it('GET /access/me returns empty array for officer with no access');
  it('POST /access/grant gives officer access to POLICE dashboard');
  it('POST /access/grant-multiple gives officer access to POLICE and RIB at once');
  it('DELETE /access/revoke removes access correctly');
  it('Cannot revoke own ADMIN access (safety check)');
  it('dashboardGuard middleware blocks request without X-Dashboard-Type header');
  it('dashboardGuard middleware blocks officer accessing dashboard they lack access to');
  it('dashboardGuard middleware always passes for SUPER_ADMIN role');
  it('Login response includes dashboardAccess array');
  it('Officer with 2 dashboard access values gets routed to picker (frontend logic, test via integration)');
  it('Officer with 1 dashboard access value skips picker (frontend logic, test via integration)');
  it('Non-admin role returns 403 on GET /access (list all)');
});
```

---

## Definition of Done

**Backend**
- [ ] `DashboardAccess` model migrated
- [ ] Super Admin seeded with access to all 5 dashboards
- [ ] Each agency's first officer seeded with access to their own dashboard only
- [ ] All 5 access endpoints work correctly
- [ ] `dashboardGuard` middleware correctly blocks/allows based on access
- [ ] Login response includes `dashboardAccess` array
- [ ] All 12 access tests pass

**Unified Portal App**
- [ ] `apps/portal` runs and shows login page
- [ ] OTP flow works end-to-end
- [ ] Single-access officer redirects automatically to their dashboard
- [ ] Multi-access officer sees the dashboard picker
- [ ] Zero-access officer sees "contact administrator" message
- [ ] Token handoff via URL fragment works — token never appears in server logs

**Each Dashboard App**
- [ ] `/auth/handoff` page receives and stores tokens correctly
- [ ] URL fragment is cleared immediately after reading
- [ ] Old standalone login pages removed (or redirect to portal)

**Admin Access Management**
- [ ] `/dashboard/access` page in admin dashboard shows all officers
- [ ] Checkbox grid correctly grants/revokes access per dashboard
- [ ] Changes reflect immediately and persist on refresh
- [ ] Access changes appear in the audit log

**Settings Page (All Dashboards)**
- [ ] Profile tab shows and allows editing name/email
- [ ] Notifications tab toggles all 5 preference types
- [ ] Security tab has working "logout all devices" button
- [ ] My Access tab shows the officer's own granted dashboards
- [ ] Admin dashboard has the extra "System Configuration" tab
- [ ] Settings page UI is identical across all 5 dashboards (shared component)

---

## Notes for Developer

- Consider extracting the Settings page into the `packages/ui-components` shared package since it's identical across all 5 dashboards — this avoids maintaining 5 copies
- The URL fragment handoff pattern works because fragments (`#...`) are never sent in the HTTP request to the server — they're purely client-side. This is why we use `#at=` instead of `?at=`
- In production, consider replacing the fragment handoff with a short-lived one-time exchange code instead: portal generates a random code, stores `{code: tokens}` in Redis for 30 seconds, redirects with `?code=xyz`, and the receiving dashboard calls `POST /auth/exchange` with the code to get the real tokens. This is more secure than passing JWTs directly in the URL, even via fragment. Recommended before public launch.
- The `apps/portal` app should be deployed as its own Vercel project: `rwanda-safe-portal`
- Update all dashboard login pages to redirect to the portal URL instead of showing their own login form: `window.location.href = 'https://rwanda-safe-portal.vercel.app'`

---

*Rwanda Safe — Unified Dashboard Login & Access Control Prompt v1.0*
