
import { pgTable, uuid, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

/**
 * Global System Features Table
 * Defines features that can be assigned to plans
 */
export const systemFeatures = pgTable('system_features', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    featureKey: text('feature_key').notNull().unique(),
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
