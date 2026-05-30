import { createClient } from 'redis';
import { env } from './env';
import { logger } from '../middleware/logger';

export const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('error', (err) => logger.error('Redis error', err));

export async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info('Redis connected');
  } catch (err) {
    logger.warn('Redis connection failed — continuing without cache', err);
  }
}
