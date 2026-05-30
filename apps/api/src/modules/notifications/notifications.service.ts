import { sendPushNotification, sendTopicNotification } from './fcm.service';

export const notificationsService = {
  async notifyReportReceived(userId: string, trackingCode: string): Promise<void> {
    await sendPushNotification(
      userId,
      'Report Received',
      `Your report ${trackingCode} has been received. We will respond shortly.`,
      { trackingCode, action: 'report_received' }
    );
  },

  async notifyStatusChange(userId: string, trackingCode: string, newStatus: string): Promise<void> {
    const statusLabel = newStatus.replace(/_/g, ' ').toLowerCase();
    await sendPushNotification(
      userId,
      'Report Update',
      `Update on ${trackingCode}: Your report is now ${statusLabel}.`,
      { trackingCode, status: newStatus, action: 'status_change' }
    );
  },

  async notifyNewMessage(userId: string, trackingCode: string): Promise<void> {
    await sendPushNotification(
      userId,
      'New Message',
      `New message on your report ${trackingCode}. Open the app to read.`,
      { trackingCode, action: 'new_message' }
    );
  },

  async broadcastAlert(title: string, message: string, district: string | null): Promise<void> {
    const topic = district ? `district_${district.replace(/\s+/g, '_')}` : 'all_users';
    await sendTopicNotification(topic, title, message);
  },
};
