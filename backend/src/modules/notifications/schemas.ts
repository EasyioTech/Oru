
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { notifications } from '../../infrastructure/database/schemas/notifications.js';
import { mapToSnakeCase, mapToCamelCase } from '../../utils/case-transform.js';

export const notificationSchema = createSelectSchema(notifications);

export const listNotificationsQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
    isRead: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    agencyId: z.string().uuid().optional(),
});
export type ListNotificationsQueryInput = z.infer<typeof listNotificationsQuerySchema>;

export const connectionAuthSchema = z.object({
    params: z.object({
        token: z.string().optional()
    })
});

export const createNotificationSchema = createInsertSchema(notifications).omit({
    id: true,
    createdAt: true,
    readAt: true,
    isRead: true
});
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const notificationsResponseSchema = z.object({
    notifications: z.array(notificationSchema.transform(data => mapToSnakeCase(data))),
    pagination: z.object({
        total: z.number(),
        limit: z.number(),
        offset: z.number(),
        unreadCount: z.number()
    })
});

export const unreadCountResponseSchema = z.object({
    unreadCount: z.number()
});
