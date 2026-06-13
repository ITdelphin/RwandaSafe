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

  const scan = (dir: string, depth: number = 0): any => {
    if (depth > 3) return '(max depth)';
    const full = path.join(cwd, dir);
    try {
      const files = fs.readdirSync(full);
      const info: Record<string, any> = {};
      for (const f of files.slice(0, 20)) {
        const fpath = path.join(full, f);
        const stat = fs.statSync(fpath);
        if (stat.isDirectory()) {
          info[f] = scan(path.join(dir, f), depth + 1);
        } else {
          info[f] = `file (${stat.size}B)`;
        }
      }
      return info;
    } catch {
      return null;
    }
  };

  const interestingPaths = [
    '',
    'api',
    'api/prisma-client',
    'apps/api',
    'apps/api/api',
    'apps/api/api/prisma-client',
    'node_modules',
    'node_modules/.prisma',
    'node_modules/.prisma/client',
  ];

  for (const p of interestingPaths) {
    results[p] = scan(p);
  }

  res.json(results);
});

app.all('*', (req, res) => {
  res.json({ message: 'API is running', path: req.path });
});

export default app;
