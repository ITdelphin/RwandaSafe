// Vercel serverless entry point
import 'dotenv/config';

if (process.env.DB_PASS && process.env.DB_HOST && process.env.DB_USER) {
  const user = encodeURIComponent(process.env.DB_USER);
  const pass = encodeURIComponent(process.env.DB_PASS);
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '6543';
  const name = process.env.DB_NAME || 'postgres';
  const pgbouncer = port === '6543' ? '&pgbouncer=true' : '';
  process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${name}?connection_limit=5${pgbouncer}`;
}

import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

app.get('/health', (_req, res) => {
  const cwd = process.cwd();

  const results: Record<string, any> = { cwd };

  const check = (p: string) => {
    const full = path.join(cwd, p);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        return { exists: true, type: 'dir', files: fs.readdirSync(full).slice(0, 25) };
      }
      return { exists: true, type: 'file', size: stat.size };
    } catch {
      return { exists: false };
    }
  };

  results.prismaClientAtApi = check('api/prisma-client');
  results.prismaClientAtNodeModules = check('node_modules/.prisma/client');
  results.prismaClientAtApps = check('apps/api/api/prisma-client');
  results.nodeModulesDotPrisma = check('node_modules/.prisma');
  results.apiDir = check('api');
  results.appsApiDir = check('apps/api');
  results.appsApiApiDir = check('apps/api/api');

  // Try loading PrismaClient
  try {
    const pc = require('./prisma-client');
    results.prismaLoadable = true;
  } catch (e: any) {
    results.prismaLoadError = e.message;
  }

  res.json(results);
});

export default app;
