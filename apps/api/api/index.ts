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

const app = express();

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    node: process.version,
  });
});

app.all('*', (req, res) => {
  res.json({ message: 'API is running', path: req.path });
});

export default app;
