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

  const checkDir = (dirPath: string) => {
    const full = path.join(cwd, dirPath);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        return { exists: true, type: 'dir', files: fs.readdirSync(full).slice(0, 30) };
      }
      return { exists: true, type: 'file', size: stat.size };
    } catch {
      return { exists: false };
    }
  };

  results.rootDirs = checkDir('');
  results.apiDir = checkDir('api');
  results.prismaClientDir = checkDir('api/prisma-client');
  results.prismaInNodeModules = checkDir('node_modules/.prisma');
  results.appsDir = checkDir('apps');
  results.vcDir = checkDir('___vc');

  res.json(results);
});

app.all('*', (req, res) => {
  res.json({ message: 'API is running', path: req.path });
});

export default app;
