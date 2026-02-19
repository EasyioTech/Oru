
import { pgTable, uuid, text, timestamp, jsonb, index, integer } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { agencies } from './agency.js';
import { isNull } from 'drizzle-orm';

/**
 * Support Tickets Table
 */
export const tickets = pgTable('tickets', {
    id: uuid('id').defaultRandom().primaryKey(),
    ticketNumber: text('ticket_number').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: text('status').default('open').notNull(), // open, in_progress, resolved, closed
    priority: text('priority').default('medium').notNull(), // low, medium, high
    category: text('category').default('general').notNull(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    assignedTo: uuid('assigned_to').references(() => users.id),
    department: text('department'),
    pageUrl: text('page_url'),
    screenshotUrl: text('screenshot_url'),
    consoleLogs: jsonb('console_logs'),
    errorDetails: jsonb('error_details'),
    browserInfo: jsonb('browser_info'),
    metadata: jsonb('metadata').default({}).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
}, (table) => ({
    ticketNumberIdx: index('idx_tickets_ticket_number').on(table.ticketNumber).where(isNull(table.deletedAt)),
    statusIdx: index('idx_tickets_status').on(table.status).where(isNull(table.deletedAt)),
    priorityIdx: index('idx_tickets_priority').on(table.priority).where(isNull(table.deletedAt)),
    agencyIdIdx: index('idx_tickets_agency_id').on(table.agencyId).where(isNull(table.deletedAt)),
    userIdIdx: index('idx_tickets_user_id').on(table.userId),
    createdAtIdx: index('idx_tickets_created_at').on(table.createdAt),
}));
