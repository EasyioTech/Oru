
import { pgTable, uuid, varchar, decimal, boolean, timestamp, index } from 'drizzle-orm/pg-core';

/**
 * Currencies Table
 * Manages multi-currency support for the system
 */
export const currencies = pgTable('currencies', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 3 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    symbol: varchar('symbol', { length: 10 }),
    exchangeRate: decimal('exchange_rate', { precision: 10, scale: 4 }).default('1'),
    isBase: boolean('is_base').default(false),
    isActive: boolean('is_active').default(true),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    codeIdx: index('idx_currencies_code').on(table.code),
    isBaseIdx: index('idx_currencies_is_base').on(table.isBase),
}));
