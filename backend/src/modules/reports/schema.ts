import { pgTable, uuid, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { agencies } from '../../infrastructure/database/schemas/agency.js';
import { users } from '../../infrastructure/database/schemas/users.js';

export const reportDefinitions = pgTable('report_definitions', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    module: text('module').notNull(), // finance, hr, inventory, projects, etc.
    parameters: jsonb('parameters').default([]).notNull(), // array of param configs
    queryConfig: jsonb('query_config').default({}).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyModuleIdx: index('idx_report_definitions_agency_module').on(table.agencyId, table.module),
}));

export const reportRuns = pgTable('report_runs', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    reportId: uuid('report_id').references(() => reportDefinitions.id, { onDelete: 'cascade' }).notNull(),
    runBy: uuid('run_by').references(() => users.id).notNull(),
    parameters: jsonb('parameters').default({}).notNull(),
    status: text('status').default('pending').notNull(), // pending, processing, completed, failed
    format: text('format').default('json').notNull(), // json, csv, excel, pdf
    fileUrl: text('file_url'), // S3 URL for exported files
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
