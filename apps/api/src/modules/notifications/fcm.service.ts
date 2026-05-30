import { prisma } from '../../config/database';
import { logger } from '../../middleware/logger';

let messaging: any;

function getMessaging() {
  if (!messaging) {
    try {
      const admin = require('firebase-admin');
      if (admin.apps.length) {
        messaging = admin.messaging();
      }
    } catch {
      // Firebase not configured
    }
  }
  return messaging;
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { fcmToken: true } });
    if (!user?.fcmToken) return;

    const msg = getMessaging();
    if (!msg) {
      logger.debug(`[FCM-skip] ${title}: ${body} → user ${userId}`);
      return;
    }

    await msg.send({
      token: user.fcmToken,
      notification: { title, body },
      data: data ?? {},
    });
  } catch (err) {
    logger.error('FCM send failed', { userId, err });
  }
}

export async function sendTopicNotification(
  topic: string,
  title: string,
  body: string
): Promise<void> {
  try {
    const msg = getMessaging();
    if (!msg) {
      logger.debug(`[FCM-topic-skip] ${topic}: ${title}`);
      return;
    }
    await msg.send({ topic, notification: { title, body } });
  } catch (err) {
    logger.error('FCM topic send failed', { topic, err });
  }
}
