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

export const officerPhoneOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(rwandaPhoneRegex, 'Enter a valid Rwandan phone number (+2507XXXXXXXX)'),
  }),
});
