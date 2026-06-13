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

app.get('/health', async (_req, res) => {
  try {
    const checks: Record<string, any> = {
      env: {
        node: process.version,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd(),
      }
    };

    // Check if .prisma exists
    const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
    checks.prisma = {
      exists: fs.existsSync(prismaClientPath),
      files: fs.existsSync(prismaClientPath) ? fs.readdirSync(prismaClientPath).slice(0, 10) : [],
    };

    // Try loading @prisma/client
    try {
      const { PrismaClient } = require('@prisma/client');
      checks.prisma.clientLoadable = true;
      const p = new PrismaClient();
      await p.$connect();
      checks.prisma.dbConnected = true;
      await p.$disconnect();
    } catch (err2: any) {
      checks.prisma.error = err2.message;
    }

    res.json(checks);
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.all('*', (req, res) => {
  res.json({ message: 'API is running', path: req.path });
});

export default app;
