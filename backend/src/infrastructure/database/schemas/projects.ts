
import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { agencies } from './agency.js';
import { users } from './users.js';
import { clients } from './crm.js';
import { currencies } from './public.js';
import { isNull } from 'drizzle-orm';

/**
 * Projects Table
 * Core project management entity
 */
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
    allocatedBudget: numeric('allocated_budget', { precision: 12, scale: 2 }).default('0'),
    costCenter: text('cost_center'),
    currencyId: uuid('currency_id').references(() => currencies.id).default('00000000-0000-0000-0000-000000000000'), // Link to currencies table
    currency: text('currency').default('USD').notNull(), // Keep for display/cache

    // Relationships
    clientId: uuid('client_id').references(() => clients.id),
    projectManagerId: uuid('project_manager_id').references(() => users.id),
    accountManagerId: uuid('account_manager_id').references(() => users.id),

    // Team & Metadata
    assignedTeam: jsonb('assigned_team').default([]).notNull(), // Array of user IDs
    departments: jsonb('departments').default([]).notNull(),
    tags: jsonb('tags').default([]).notNull(),
    categories: jsonb('categories').default([]).notNull(),
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
