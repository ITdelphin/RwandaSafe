# Rwanda Safe — Consolidated Developer Prompt: Citizen Sign-In (Complete)

> **Merges:** Chapter 1 (auth foundation) + Chapter 2 (citizen screens) + Email OTP addition  
> **Purpose:** One single reference for everything related to how a CITIZEN signs in to Rwanda Safe — phone OTP, email OTP, guest mode, and token management. Give this whole document to your developer for the citizen sign-in feature alone.

---

## Overview — 3 Ways a Citizen Can Access Rwanda Safe

| Method | Use Case | Requires Account |
|---|---|---|
| **Phone OTP** | Primary method — most Rwandans have a phone number | Yes (auto-created on first OTP) |
| **Email OTP** | Alternative for users who prefer email or have email-only devices | Yes (auto-created on first OTP) |
| **Guest / Anonymous** | Citizen wants to report without creating an account | No |

All three converge into the same `User` table and issue the same JWT access + refresh tokens.

---

## Part A — Backend: Complete Auth System

### A1. Prisma Schema (User + Auth tables)

```prisma
enum Role {
  CITIZEN
  POLICE_OFFICER
  MEDICAL_RESPONDER
  FIRE_OFFICER
  RIB_INVESTIGATOR
  SUPER_ADMIN
}

model User {
  id              String    @id @default(uuid())
  phone           String?   @unique
  email           String?   @unique
  name            String?
  nidaId          String?   @unique @map("nida_id")
  role            Role      @default(CITIZEN)
  isVerified      Boolean   @default(false) @map("is_verified")
  isEmailVerified Boolean   @default(false) @map("is_email_verified")
  isAnonymous     Boolean   @default(false) @map("is_anonymous")
  isActive        Boolean   @default(true) @map("is_active")
  fcmToken        String?   @map("fcm_token")
  preferredLang   String    @default("en") @map("preferred_lang")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  lastLoginAt     DateTime? @map("last_login_at")

  otpCodes        OtpCode[]
  refreshTokens   RefreshToken[]
  incidents       Incident[]      @relation("ReporterIncidents")

  @@map("users")
}

model OtpCode {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  code        String
  channel     String    @default("SMS")   // "SMS" or "EMAIL"
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
```

Note: both `phone` and `email` are now **optional** (not required) since a citizen can sign up with either one. Add a database constraint check at the application level: at least one of `phone` or `email` must be present.

Run:
```bash
cd apps/api && npx prisma migrate dev --name citizen_auth_complete
```

---

### A2. Auth Schema (Zod Validation)

Create/update `apps/api/src/modules/auth/auth.schema.ts`:

```typescript
import { z } from 'zod';

const rwandaPhoneRegex = /^\+2507[2389]\d{7}$/;

export const sendPhoneOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(rwandaPhoneRegex, 'Enter a valid Rwandan phone number (+2507XXXXXXXX)'),
    name: z.string().min(2).max(100).optional(),
    lang: z.enum(['en', 'rw', 'fr']).default('en'),
  }),
});

export const verifyPhoneOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(rwandaPhoneRegex),
    code: z.string().length(6),
  }),
});

export const sendEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Enter a valid email address'),
    name: z.string().min(2).max(100).optional(),
    lang: z.enum(['en', 'rw', 'fr']).default('en'),
  }),
});

export const verifyEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const guestSessionSchema = z.object({
  body: z.object({
    lang: z.enum(['en', 'rw', 'fr']).default('en'),
  }),
});
```

---

### A3. Auth Service — Full Implementation

Create `apps/api/src/modules/auth/auth.service.ts`:

```typescript
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { createOtp, verifyOtp, sendOtpSms } from '../../utils/otp';
import { createAndSendEmailOtp, verifyEmailOtpCode } from '../../utils/emailOtp';
import { Role } from '@prisma/client';

function generateTokenPair(user: { id: string; phone?: string | null; email?: string | null; role: Role }) {
  const accessToken = jwt.sign(
    { id: user.id, phone: user.phone, email: user.email, role: user.role, isAnonymous: false },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

export const authService = {

  // ───── PHONE OTP FLOW ─────

  async sendPhoneOtp(phone: string, name?: string, lang: 'en' | 'rw' | 'fr' = 'en') {
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: { phone, name, role: Role.CITIZEN, preferredLang: lang },
      });
    }

    const code = await createOtp(user.id, 'SMS');
    await sendOtpSms(phone, code, lang);

    return { message: 'Verification code sent via SMS' };
  },

  async verifyPhoneOtp(phone: string, code: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new Error('No account found with this phone number');

    const isValid = await verifyOtp(user.id, code);
    if (!isValid) throw new Error('Invalid or expired code');

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, lastLoginAt: new Date() },
    });

    const tokens = generateTokenPair(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user: this.toPublicUser(user) };
  },

  // ───── EMAIL OTP FLOW ─────

  async sendEmailOtp(email: string, name?: string, lang: 'en' | 'rw' | 'fr' = 'en') {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, role: Role.CITIZEN, preferredLang: lang },
      });
    }

    await createAndSendEmailOtp(user.id, email, lang);

    return { message: 'Verification code sent to your email' };
  },

  async verifyEmailOtp(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('No account found with this email');

    const isValid = await verifyEmailOtpCode(user.id, code);
    if (!isValid) throw new Error('Invalid or expired code');

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, isEmailVerified: true, lastLoginAt: new Date() },
    });

    const tokens = generateTokenPair(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, user: this.toPublicUser(user) };
  },

  // ───── GUEST / ANONYMOUS SESSION ─────

  /**
   * Creates a temporary anonymous session.
   * No phone, no email — just an anonymous user record.
   * Used for citizens who want to submit a report without an account.
   * Token has shorter expiry (no refresh token issued).
   */
  async createGuestSession(lang: 'en' | 'rw' | 'fr' = 'en') {
    const user = await prisma.user.create({
      data: {
        role: Role.CITIZEN,
        isAnonymous: true,
        preferredLang: lang,
      },
    });

    const accessToken = jwt.sign(
      { id: user.id, role: Role.CITIZEN, isAnonymous: true },
      env.JWT_SECRET,
      { expiresIn: '24h' } // Guest sessions last 24h, no refresh
    );

    return { accessToken, user: this.toPublicUser(user) };
  },

  // ───── SHARED TOKEN LOGIC ─────

  async storeRefreshToken(userId: string, token: string) {
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  },

  async refreshAccessToken(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const accessToken = jwt.sign(
      { id: stored.user.id, phone: stored.user.phone, email: stored.user.email, role: stored.user.role, isAnonymous: false },
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

  toPublicUser(user: any) {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      preferredLang: user.preferredLang,
    };
  },
};
```

---

### A4. Auth Router — Complete

Create `apps/api/src/modules/auth/auth.router.ts`:

```typescript
import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import {
  sendPhoneOtpSchema, verifyPhoneOtpSchema,
  sendEmailOtpSchema, verifyEmailOtpSchema,
  refreshTokenSchema, guestSessionSchema,
} from './auth.schema';

export const authRouter = Router();

authRouter.use(authRateLimiter); // 5 requests/min on all auth routes

// Phone OTP
authRouter.post('/phone/send', validate(sendPhoneOtpSchema), authController.sendPhoneOtp);
authRouter.post('/phone/verify', validate(verifyPhoneOtpSchema), authController.verifyPhoneOtp);

// Email OTP
authRouter.post('/email/send', validate(sendEmailOtpSchema), authController.sendEmailOtp);
authRouter.post('/email/verify', validate(verifyEmailOtpSchema), authController.verifyEmailOtp);

// Guest session (no OTP needed)
authRouter.post('/guest', validate(guestSessionSchema), authController.createGuestSession);

// Shared
authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authController.getMe); // requires auth middleware
```

> **Note:** This replaces the old `/register`, `/verify`, `/login` paths from earlier with clearer `/phone/send`, `/phone/verify`, `/email/send`, `/email/verify` naming. If your developer already built the old paths, keep both for backward compatibility or do a clean rename — rename is recommended since the project is still in development.

---

### A5. Full Endpoint Reference

```
POST   /v1/auth/phone/send       { phone, name?, lang? }       → sends SMS OTP
POST   /v1/auth/phone/verify     { phone, code }               → returns tokens
POST   /v1/auth/email/send       { email, name?, lang? }       → sends email OTP
POST   /v1/auth/email/verify     { email, code }               → returns tokens
POST   /v1/auth/guest            { lang? }                     → returns guest token (no refresh)
POST   /v1/auth/refresh          { refreshToken }              → returns new access token
POST   /v1/auth/logout           { refreshToken }               → revokes refresh token
GET    /v1/auth/me               (auth required)                → returns current user profile
```

---

## Part B — Mobile App: Citizen Sign-In Screens

### B1. Folder Structure

```
apps/mobile/app/(auth)/
├── _layout.tsx
├── welcome.tsx          # Choose sign-in method + language
├── phone.tsx            # Phone number entry
├── phone-verify.tsx     # Phone OTP verification
├── email.tsx            # Email entry
├── email-verify.tsx     # Email OTP verification
```

### B2. `welcome.tsx` — Entry Screen

```
[Rwanda Safe Logo]
"Your safety is our priority"

Language selector: English | Ikinyarwanda | Français

┌─────────────────────────────┐
│  📱  Continue with Phone     │
└─────────────────────────────┘
┌─────────────────────────────┐
│  ✉️  Continue with Email     │
└─────────────────────────────┘
┌─────────────────────────────┐
│  👤  Continue as Guest       │
└─────────────────────────────┘

"By continuing, you agree to our Terms & Privacy Policy"
```

Routing:
- "Continue with Phone" → `phone.tsx`
- "Continue with Email" → `email.tsx`
- "Continue as Guest" → directly calls `POST /v1/auth/guest`, saves token, navigates to `(app)/home`

### B3. `phone.tsx` — Phone Entry

```typescript
export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidPhone = /^\+2507[2389]\d{7}$/.test(phone);

  async function handleSendOtp() {
    setLoading(true);
    try {
      await apiClient.post('/auth/phone/send', { phone, lang: currentLang });
      router.push({ pathname: '/phone-verify', params: { phone } });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error ?? 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Text>Enter your phone number</Text>
      <View style={styles.phoneInputRow}>
        <Text style={styles.prefix}>+250</Text>
        <TextInput
          value={phone.replace('+250', '')}
          onChangeText={(t) => setPhone('+250' + t.replace(/\D/g, ''))}
          keyboardType="phone-pad"
          maxLength={9}
          placeholder="788123456"
        />
      </View>
      <Button title="Send Code" onPress={handleSendOtp} disabled={!isValidPhone || loading} loading={loading} />
    </View>
  );
}
```

### B4. `phone-verify.tsx` — Phone OTP Verification

```typescript
export default function PhoneVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => setResendTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleVerify() {
    try {
      const { data } = await apiClient.post('/auth/phone/verify', { phone, code });
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      router.replace('/(app)/home');
    } catch (err) {
      Alert.alert('Invalid code', 'Please check the code and try again.');
    }
  }

  async function handleResend() {
    await apiClient.post('/auth/phone/send', { phone });
    setResendTimer(60);
  }

  return (
    <View>
      <Text>Enter the 6-digit code sent to {phone}</Text>
      <OtpInput value={code} onChange={setCode} length={6} />
      <Button title="Verify" onPress={handleVerify} disabled={code.length !== 6} />
      <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
        <Text>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### B5. `email.tsx` and `email-verify.tsx`

Same pattern as phone screens, but:
- Validates email format instead of phone format
- Calls `/auth/email/send` and `/auth/email/verify`
- No country prefix needed

```typescript
// email.tsx — key difference from phone.tsx
const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

async function handleSendOtp() {
  await apiClient.post('/auth/email/send', { email, lang: currentLang });
  router.push({ pathname: '/email-verify', params: { email } });
}
```

```typescript
// email-verify.tsx — same OTP input pattern as phone-verify.tsx
async function handleVerify() {
  const { data } = await apiClient.post('/auth/email/verify', { email, code });
  setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
  router.replace('/(app)/home');
}
```

### B6. Updated Auth Store

```typescript
// src/store/authStore.ts
interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role: string;
  isVerified: boolean;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setGuestAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isGuest: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, isGuest: false }),
      setGuestAuth: (user, accessToken) =>
        set({ user, accessToken, refreshToken: null, isAuthenticated: true, isGuest: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isGuest: false }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

---

## Part C — Web Portal: Citizen Sign-In Pages

### C1. Folder Structure

```
apps/web-citizen/src/app/
├── login/
│   ├── page.tsx              # Method selector
│   ├── phone/page.tsx
│   ├── phone/verify/page.tsx
│   ├── email/page.tsx
│   └── email/verify/page.tsx
```

### C2. `login/page.tsx` — Method Selector

```tsx
export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <Logo />
      <h1 className="text-2xl font-bold mt-4">Sign in to Rwanda Safe</h1>

      <div className="mt-6 space-y-3">
        <Link href="/login/phone" className="btn-primary w-full">
          📱 Continue with Phone
        </Link>
        <Link href="/login/email" className="btn-secondary w-full">
          ✉️ Continue with Email
        </Link>
        <Link href="/report?guest=true" className="btn-ghost w-full">
          Continue as Guest
        </Link>
      </div>
    </div>
  );
}
```

### C3. Phone & Email Flow Pages

Same logic as mobile — `react-hook-form` + `zod` validation, call `/auth/phone/send` → `/auth/phone/verify`, store tokens in Zustand + cookie (for SSR auth checks).

```tsx
// login/phone/page.tsx
const schema = z.object({
  phone: z.string().regex(/^\+2507[2389]\d{7}$/, 'Invalid Rwandan phone number'),
});

export default function PhoneLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const router = useRouter();

  async function onSubmit(data: { phone: string }) {
    await apiClient.post('/auth/phone/send', data);
    router.push(`/login/phone/verify?phone=${encodeURIComponent(data.phone)}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('phone')} placeholder="+250788123456" />
      {errors.phone && <p className="error">{errors.phone.message}</p>}
      <button type="submit">Send Code</button>
    </form>
  );
}
```

---

## Part D — Backend Tests

Create `apps/api/src/modules/auth/auth.test.ts`:

```typescript
describe('Citizen Auth — Complete', () => {

  describe('Phone OTP', () => {
    it('POST /auth/phone/send creates new user for unseen phone');
    it('POST /auth/phone/send reuses existing user for known phone');
    it('POST /auth/phone/send returns 400 for non-Rwandan number');
    it('POST /auth/phone/verify returns tokens for correct OTP');
    it('POST /auth/phone/verify returns 400 for wrong OTP');
    it('POST /auth/phone/verify returns 400 for expired OTP');
    it('OTP cannot be reused after successful verification');
  });

  describe('Email OTP', () => {
    it('POST /auth/email/send creates new user for unseen email');
    it('POST /auth/email/send returns 400 for invalid email format');
    it('POST /auth/email/verify returns tokens for correct OTP');
    it('POST /auth/email/verify sets isEmailVerified=true');
  });

  describe('Guest Session', () => {
    it('POST /auth/guest creates anonymous user with isAnonymous=true');
    it('POST /auth/guest token has no associated refresh token');
    it('Guest token expires in 24h, not 30 days');
  });

  describe('Token Management', () => {
    it('POST /auth/refresh returns new access token for valid refresh token');
    it('POST /auth/refresh returns 401 for revoked token');
    it('POST /auth/logout revokes the refresh token');
    it('GET /auth/me returns current user profile with valid token');
    it('GET /auth/me returns 401 without token');
  });

  describe('Rate Limiting', () => {
    it('6th request to /auth/phone/send within 1 minute returns 429');
  });
});
```

---

## Definition of Done — Citizen Sign-In

**Backend**
- [ ] `phone` and `email` fields are both optional on User model, but at least one is required at signup
- [ ] All 8 auth endpoints respond correctly
- [ ] Phone OTP and Email OTP both create/reuse the same User record type
- [ ] Guest sessions create anonymous users with 24h token, no refresh token
- [ ] Rate limiting active on all `/auth/*` routes (5/min)
- [ ] All auth tests pass

**Mobile App**
- [ ] Welcome screen offers all 3 sign-in methods
- [ ] Phone flow: entry → OTP → home works end-to-end
- [ ] Email flow: entry → OTP → home works end-to-end
- [ ] Guest flow: instant access to home screen, no OTP step
- [ ] Resend code button has 60-second cooldown
- [ ] Auth state persists across app restarts (AsyncStorage)
- [ ] Guest users see a banner prompting them to create a full account for tracking history

**Web Portal**
- [ ] Login method selector page works
- [ ] Phone and Email flows both work end-to-end
- [ ] Guest "Continue as Guest" skips straight to report form
- [ ] Tokens stored securely (httpOnly cookie recommended for production)

---

## Notes for Developer

- Guest accounts should be periodically cleaned up if never used — add to the Chapter 7 `dataCleanupJob`: delete `User` records where `isAnonymous=true` AND no incidents created AND `createdAt` older than 7 days
- If a citizen signs in with phone first, then later wants to add an email (or vice versa), build a simple "Link Email" / "Link Phone" option in account settings that calls the same OTP endpoints but updates the existing user record instead of creating a new one (requires being authenticated first — add a new endpoint `POST /v1/auth/link-email` and `POST /v1/auth/link-phone` if this is needed)
- Never allow a guest session token to access `/incidents` GET list endpoints for past reports — guests can only create new reports and track by tracking code, not view a personal history (since there's no persistent identity)

---

*Rwanda Safe — Consolidated Citizen Sign-In Prompt v1.0*
