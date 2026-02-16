
import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { agencies } from './agency.js';

/**
 * Notifications Table
 */
export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').default('info').notNull(), // info, success, warning, error
    priority: text('priority').default('normal').notNull(), // low, normal, high, urgent
    link: text('link'),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('idx_notifications_user_id').on(table.userId),
    agencyIdIdx: index('idx_notifications_agency_id').on(table.agencyId),
    readIdx: index('idx_notifications_is_read').on(table.isRead),
    createdAtIdx: index('idx_notifications_created_at').on(table.createdAt),
}));
