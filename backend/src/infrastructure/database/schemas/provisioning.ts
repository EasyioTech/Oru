
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { provisioningJobStatusEnum } from './enums.js';
import { users } from './users.js';
import { agencies } from './agency.js';

/**
 * Agency Provisioning Jobs Table
 * Detailed tracking of provisioning process
 */
export const agencyProvisioningJobs = pgTable('agency_provisioning_jobs', {
    id: uuid('id').defaultRandom().primaryKey(),
    idempotencyKey: text('idempotency_key'),
    status: provisioningJobStatusEnum('status').default('pending').notNull(),

    // Target Spec
    domain: text('domain').notNull(),
    databaseName: text('database_name').notNull(),
    agencyName: text('agency_name').notNull(),
    ownerEmail: text('owner_email').notNull(),
    subscriptionPlan: text('subscription_plan'),

    // Request Info
    requestedBy: uuid('requested_by').references(() => users.id),
    payload: jsonb('payload').default({}).notNull(),

    // Progress & State
    validationErrors: jsonb('validation_errors'),
    progressPercentage: integer('progress_percentage').default(0).notNull(),
    currentStep: text('current_step'),
    stepsCompleted: text('steps_completed').array().default([]),
    stepsTotal: integer('steps_total'),
    result: jsonb('result'),
    agencyId: uuid('agency_id').references(() => agencies.id),

    // Error Handling
    errorMessage: text('error_message'),
    errorCode: text('error_code'),
    errorDetails: jsonb('error_details'),
    stackTrace: text('stack_trace'),
    retryCount: integer('retry_count').default(0).notNull(),
    maxRetries: integer('max_retries').default(3).notNull(),
    nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),

    // Execution Control
    priority: integer('priority').default(5).notNull(),
    timeoutSeconds: integer('timeout_seconds').default(300).notNull(),
    workerId: text('worker_id'),
    workerHostname: text('worker_hostname'),

    // Timestamps
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelledBy: uuid('cancelled_by').references(() => users.id),
    cancellationReason: text('cancellation_reason'),
    estimatedCompletionAt: timestamp('estimated_completion_at', { withTimezone: true }),

    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    idempotencyIdx: uniqueIndex('idx_agency_provisioning_jobs_idempotency').on(table.idempotencyKey).where(sql`idempotency_key IS NOT NULL`),
    statusIdx: index('idx_agency_provisioning_jobs_status').on(table.status, table.priority),
    domainIdx: index('idx_agency_provisioning_jobs_domain').on(table.domain), // In SQL it is lower(domain)
    databaseNameIdx: index('idx_agency_provisioning_jobs_database_name').on(table.databaseName),
    requestedByIdx: index('idx_agency_provisioning_jobs_requested_by').on(table.requestedBy),
    agencyIdIdx: index('idx_agency_provisioning_jobs_agency_id').on(table.agencyId),
    createdAtIdx: index('idx_agency_provisioning_jobs_created_at').on(table.createdAt),
}));

/**
 * Agency Provisioning Logs
 */
export const agencyProvisioningLogs = pgTable('agency_provisioning_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    jobId: uuid('job_id').notNull().references(() => agencyProvisioningJobs.id, { onDelete: 'cascade' }),
    level: text('level').notNull(), // debug, info, warn, error
    message: text('message').notNull(),
    step: text('step'),
    details: jsonb('details'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    jobIdIdx: index('idx_agency_provisioning_logs_job_id').on(table.jobId, table.createdAt),
    levelIdx: index('idx_agency_provisioning_logs_level').on(table.level).where(sql`level IN ('error', 'warn')`),
}));
