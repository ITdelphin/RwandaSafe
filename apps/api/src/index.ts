import 'dotenv/config';

// Construct DATABASE_URL from separate parts if DB_PASS is set
// This avoids URL-encoding issues with special characters in passwords
if (process.env.DB_PASS && process.env.DB_HOST && process.env.DB_USER) {
  const user = encodeURIComponent(process.env.DB_USER);
  const pass = encodeURIComponent(process.env.DB_PASS);
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '6543';
  const name = process.env.DB_NAME || 'postgres';
  process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${name}?pgbouncer=true&connection_limit=5`;
}

import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { initSocket } from './socket/socket';
import { logger } from './middleware/logger';
import { connectRedis } from './config/redis';

const server = http.createServer(app);
initSocket(server);

async function bootstrap() {
  await connectRedis();
  const port = Number(process.env.PORT) || env.API_PORT;
  server.listen(port, () => {
    logger.info(`Rwanda Safe API running on port ${port}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
