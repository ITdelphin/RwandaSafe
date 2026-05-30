import 'dotenv/config';
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
