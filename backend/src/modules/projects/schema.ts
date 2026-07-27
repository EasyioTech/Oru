import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { isNull } from 'drizzle-orm';
import { agencies } from '../../infrastructure/database/schemas/agency.js';
import { users } from '../../infrastructure/database/schemas/users.js';
import { clients } from '../../infrastructure/database/schemas/crm.js';
import { currencies } from '../../infrastructure/database/schemas/public.js';

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),

    // Basic Info
    name: text('name').notNull(),
    description: text('description'),
    projectCode: text('project_code'), // PRJ-2024-001
    projectType: text('project_type'), // fixed_price, hourly, retainer, internal

    // Status & Priority
    status: text('status').default('planning').notNull(), // planning, active, on_hold, completed, cancelled
    priority: text('priority').default('medium').notNull(), // low, medium, high, critical

    // Dates
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    deadline: timestamp('deadline', { withTimezone: true }),

    // Financials
    budget: numeric('budget', { precision: 12, scale: 2 }).default('0'),
    actualCost: numeric('actual_cost', { precision: 12, scale: 2 }).default('0'),
    costCenter: text('cost_center'),
    currencyId: uuid('currency_id').references(() => currencies.id),

    // Relationships
    clientId: uuid('client_id').references(() => clients.id),
    projectManagerId: uuid('project_manager_id').references(() => users.id),
    accountManagerId: uuid('account_manager_id').references(() => users.id),

    // Team & Metadata
    assignedTeam: jsonb('assigned_team').default([]).notNull(), // Array of user IDs
    departments: jsonb('departments').default([]).notNull(),
    tags: jsonb('tags').default([]).notNull(),
    customFields: jsonb('custom_fields').default({}).notNull(),

    progress: integer('progress').default(0).notNull(), // 0-100

    createdBy: uuid('created_by').references(() => users.id),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdIdx: index('idx_projects_agency_id').on(table.agencyId),
    projectCodeAgencyIdx: uniqueIndex('idx_projects_project_code_agency').on(table.projectCode, table.agencyId).where(isNull(table.deletedAt)),
    clientIdIdx: index('idx_projects_client_id').on(table.clientId),
    projectManagerIdIdx: index('idx_projects_project_manager_id').on(table.projectManagerId),
    statusIdx: index('idx_projects_status').on(table.status),
}));

export const projectTasks = pgTable('project_tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').default('todo').notNull(), // todo, in_progress, done, cancelled
    priority: text('priority').default('medium').notNull(),
    assigneeId: uuid('assignee_id').references(() => users.id),
    dueDate: timestamp('due_date', { withTimezone: true }),
    estimatedHours: numeric('estimated_hours', { precision: 8, scale: 2 }),
    actualHours: numeric('actual_hours', { precision: 8, scale: 2 }).default('0'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
