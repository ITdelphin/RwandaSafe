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
  const checks: Record<string, any> = {
    cwd,
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    },
  };

  // Check various paths for prisma client
  const paths = [
    'node_modules/.prisma/client',
    '.prisma/client',
    'node_modules/@prisma/client',
  ];
  for (const p of paths) {
    const full = path.join(cwd, p);
    try {
      checks[p] = fs.existsSync(full) ? fs.readdirSync(full).slice(0, 15) : 'NOT_FOUND';
    } catch (e: any) {
      checks[p] = `ERROR: ${e.message}`;
    }
  }

  res.json(checks);
});

app.all('*', (req, res) => {
  res.json({ message: 'API is running', path: req.path });
});

export default app;
