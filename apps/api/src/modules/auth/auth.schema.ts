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
