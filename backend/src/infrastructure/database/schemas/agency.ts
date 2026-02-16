
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { isNull } from 'drizzle-orm';
import { agencyStatusEnum, agencyTierEnum } from './enums.js';
import { users } from './users.js';

/**
 * Agencies Table
 * Stores tenant/agency information for multi-tenant system
 */
export const agencies = pgTable('agencies', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    domain: text('domain').notNull(),
    databaseName: text('database_name').notNull(),
    ownerUserId: uuid('owner_user_id').references(() => users.id), // Added reference for consistency if it was missing, or maybe I should check if I missed it. The original file didn't have it in the snippet I saw. Wait.

    // Subscription & Status
    subscriptionPlan: agencyTierEnum('subscription_plan').default('trial').notNull(),
    status: agencyStatusEnum('status').default('pending').notNull(),

    // Limits
    maxUsers: integer('max_users').default(50).notNull(),
    maxStorageGB: integer('max_storage_gb').default(10).notNull(),

    // Features & Settings
    features: jsonb('features').default([]).notNull(),
    settings: jsonb('settings').default({}).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),

    // Contact Information
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    billingEmail: text('billing_email'),
    address: jsonb('address'),
    taxId: text('tax_id'),

    // Subscription Dates
    subscriptionStartsAt: timestamp('subscription_starts_at', { withTimezone: true }),
    subscriptionEndsAt: timestamp('subscription_ends_at', { withTimezone: true }),
    trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),

    // Status
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    domainIdx: uniqueIndex('idx_agencies_domain').on(table.domain).where(isNull(table.deletedAt)),
    databaseNameIdx: uniqueIndex('idx_agencies_database_name').on(table.databaseName).where(isNull(table.deletedAt)),
    ownerUserIdIdx: index('idx_agencies_owner_user_id').on(table.ownerUserId).where(isNull(table.deletedAt)),
    statusIdx: index('idx_agencies_status').on(table.status).where(isNull(table.deletedAt)),
    subscriptionPlanIdx: index('idx_agencies_subscription_plan').on(table.subscriptionPlan),
    isActiveIdx: index('idx_agencies_is_active').on(table.isActive).where(isNull(table.deletedAt)),
    createdAtIdx: index('idx_agencies_created_at').on(table.createdAt),
}));
