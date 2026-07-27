import { Queue, Worker } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { notifications } from '../../infrastructure/database/schemas/notifications.js';
import { sendNotificationEmail } from '../../infrastructure/email/send.js';

export type NotificationJobName =
  | 'send-email'
  | 'send-push'
  | 'send-in-app'
  | 'bulk-notify';

export interface NotificationJobData {
  agencyId: string;
  userId?: string;
  userIds?: string[];
  template?: string;
  subject?: string;
  body?: string;
  metadata?: Record<string, any>;
}

export function createNotificationsQueue(redis: any) {
  return new Queue<NotificationJobData>('notifications', { connection: redis });
}

export function startNotificationsWorker(redis: any, db: NodePgDatabase<any>) {
  return new Worker<NotificationJobData>(
    'notifications',
    async (job) => {
      try {
        switch (job.name as NotificationJobName) {
          case 'send-email': {
            await sendNotificationEmail(job.data.metadata?.to ?? '', {
              title: job.data.subject ?? 'Notification',
              message: job.data.body ?? '',
              actionUrl: job.data.metadata?.actionUrl,
              actionLabel: job.data.metadata?.actionLabel,
            });
            break;
          }
          case 'send-push': {
            console.log(`[push] not implemented for job: ${job.id}`);
            break;
          }
          case 'send-in-app': {
            if (job.data.agencyId && job.data.userId) {
              await db.insert(notifications).values({
                agencyId: job.data.agencyId,
                userId: job.data.userId,
                title: job.data.subject ?? 'Notification',
                message: job.data.body ?? '',
                type: 'info',
              });
            }
            break;
          }
          case 'bulk-notify': {
            if (job.data.userIds && job.data.userIds.length > 0) {
              const queue = createNotificationsQueue(redis);
              for (const userId of job.data.userIds) {
                await queue.add('send-in-app', {
                  ...job.data,
                  userId,
                  userIds: undefined,
                });
              }
            }
            break;
          }
        }
      } catch (err) {
        console.error(`Error in notifications worker:`, err);
        throw err;
      }
    },
    { connection: redis }
  );
}
