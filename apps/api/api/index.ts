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
  const dirs = fs.readdirSync(cwd);
  const apiDir = path.join(cwd, 'api');
  const prismaDir = path.join(cwd, 'api', 'prisma-client');

  res.json({
    cwd,
    rootFiles: dirs.filter(d => !d.startsWith('.')),
    apiExists: fs.existsSync(apiDir),
    apiFiles: fs.existsSync(apiDir) ? fs.readdirSync(apiDir) : [],
    prismaClientExists: fs.existsSync(prismaDir),
    prismaClientFiles: fs.existsSync(prismaDir) ? fs.readdirSync(prismaDir).slice(0, 20) : [],
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    },
  });
});

app.all('*', (req, res) => {
  res.json({ message: 'API is running', path: req.path });
});

export default app;
