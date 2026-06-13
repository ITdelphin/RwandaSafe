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
  const buildErrorPath = path.join(cwd, 'apps', 'api', 'build_error.txt');
  try {
    const content = fs.readFileSync(buildErrorPath, 'utf8');
    res.json({ build_error: content.substring(0, 3000) });
  } catch {
    res.json({ build_error: 'NOT_FOUND', cwd, files: fs.readdirSync(cwd) });
  }
});

export default app;
