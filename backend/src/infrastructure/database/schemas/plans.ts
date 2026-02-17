
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, decimal } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Subscription Plans Table
 * Stores details for global agency tiers
 */
export const subscriptionPlans = pgTable('subscription_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(), // e.g., 'Free', 'Starter', 'Pro', 'Enterprise'
    slug: text('slug').notNull().unique(),
    description: text('description'),
    basePriceMonthly: decimal('base_price_monthly', { precision: 12, scale: 2 }).default('0').notNull(),
    basePriceYearly: decimal('base_price_yearly', { precision: 12, scale: 2 }).default('0').notNull(),
    maxUsers: integer('max_users').default(5).notNull(),
    maxStorageGb: integer('max_storage_gb').default(1).notNull(),
    features: jsonb('features').default([]).notNull(), // List of feature keys included
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
