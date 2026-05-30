import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  AT_API_KEY: z.string().optional(),
  AT_USERNAME: z.string().optional(),
  AT_SENDER_ID: z.string().default('RwandaSafe'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  WEB_CITIZEN_URL: z.string().default('http://localhost:3000'),
  DASHBOARD_POLICE_URL: z.string().default('http://localhost:3001'),
  DASHBOARD_HOSPITAL_URL: z.string().default('http://localhost:3002'),
  DASHBOARD_FIRE_URL: z.string().default('http://localhost:3003'),
  DASHBOARD_RIB_URL: z.string().default('http://localhost:3004'),
  DASHBOARD_ADMIN_URL: z.string().default('http://localhost:3005'),
  OTP_EXPIRES_MINUTES: z.coerce.number().default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@rwandasafe.rw'),
  APP_URL: z.string().default('https://rwanda-safe-admin.vercel.app'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
