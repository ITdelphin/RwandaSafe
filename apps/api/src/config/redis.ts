import { logger } from '../middleware/logger';

// Mocked redis client to prevent crashes while Redis is down
export const redisClient = {
  on: () => { },
  connect: async () => { throw new Error('Redis disabled'); },
  get: async () => null,
  set: async () => { },
  del: async () => { },
};

export async function connectRedis() {
  logger.info('Redis disabled for stability');
}
