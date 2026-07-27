import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { notifications } from './schema.js';
import { listNotificationsQuerySchema, notificationsResponseSchema, unreadCountResponseSchema, CreateNotificationInput } from './schemas.js';
import { z } from 'zod';

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
export type UnreadCountResponse = z.infer<typeof unreadCountResponseSchema>;
