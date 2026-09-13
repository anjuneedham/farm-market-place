import { db } from '@/lib/db/repositories';
import type {
  NotificationChannel,
  NotificationPayload,
  NotificationService,
  ServiceResult,
} from './types';
import { ok } from './types';

/**
 * In-app notifications are real and implemented. Email and push are designed
 * for and deliberately not built: this class is the single place they will be
 * added, so every producer of notifications already routes through it.
 */
export class InAppNotificationService implements NotificationService {
  channels(): NotificationChannel[] {
    return ['in_app'];
  }

  async notify(
    payload: NotificationPayload,
  ): Promise<ServiceResult<{ delivered: NotificationChannel[] }>> {
    db.notifications.create(payload);
    // Email and push land here once EmailService has a provider and a push
    // subscription store exists. Until then the channel list is honest.
    return ok({ delivered: ['in_app'] });
  }
}
