
import { db } from '../../infrastructure/database/index.js';
import { notifications } from '../../infrastructure/database/schema.js';
import { eq, desc, and, count, inArray, sql } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { CreateNotificationInput, ListNotificationsQueryInput } from './schemas.js';

export class NotificationsService {
    constructor(private logger: FastifyBaseLogger) { }

    async list(params: ListNotificationsQueryInput, userId: string) {
        try {
            const limit = params.limit || 20;
            const offset = params.offset || 0;
            const conditions = [eq(notifications.userId, userId)];

            if (params.isRead !== undefined) {
                conditions.push(eq(notifications.isRead, params.isRead));
            }
            if (params.agencyId) {
                conditions.push(eq(notifications.agencyId, params.agencyId));
            }

            const whereClause = and(...conditions);

            const [countResult] = await db.select({ count: count() }).from(notifications).where(whereClause);
            const total = countResult.count;

            const [unreadResult] = await db.select({ count: count() })
                .from(notifications)
                .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
            const unreadCount = unreadResult.count;

            const items = await db.select().from(notifications)
                .where(whereClause)
                .orderBy(desc(notifications.createdAt))
                .limit(limit)
                .offset(offset);

            return {
                notifications: items,
                pagination: {
                    total,
                    limit,
                    offset,
                    unreadCount
                }
            };
        } catch (error) {
            this.logger.error({ error, context: 'listNotifications' });
            throw new AppError('Failed to fetch notifications');
        }
    }

    async getUnreadCount(userId: string) {
        try {
            const [result] = await db.select({ count: count() })
                .from(notifications)
                .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
            return result.count;
        } catch (error) {
            this.logger.error({ error, context: 'getUnreadCount' });
            throw new AppError('Failed to count notifications');
        }
    }

    async markAsRead(id: string, userId: string) {
        try {
            const [notification] = await db.update(notifications)
                .set({ isRead: true, readAt: new Date() })
                .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
                .returning();

            if (!notification) throw new NotFoundError('Notification not found');
            return notification;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'markAsRead' });
            throw new AppError('Failed to update notification');
        }
    }

    async markAllAsRead(userId: string) {
        try {
            const result = await db.update(notifications)
                .set({ isRead: true, readAt: new Date() })
                .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
                .returning();
            return { count: result.length };
        } catch (error) {
            this.logger.error({ error, context: 'markAllAsRead' });
            throw new AppError('Failed to mark all as read');
        }
    }

    async create(data: CreateNotificationInput) {
        try {
            const [notification] = await db.insert(notifications).values(data).returning();
            return notification;
        } catch (error) {
            this.logger.error({ error, context: 'createNotification' });
            throw new AppError('Failed to create notification');
        }
    }

    async delete(id: string, userId: string) {
        try {
            const [notification] = await db.delete(notifications)
                .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
                .returning();

            if (!notification) throw new NotFoundError('Notification not found');
            return notification;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'deleteNotification' });
            throw new AppError('Failed to delete notification');
        }
    }
}
