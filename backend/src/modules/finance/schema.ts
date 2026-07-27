import { pgTable, uuid, text, timestamp, numeric, boolean, date } from 'drizzle-orm/pg-core';
import { agencies } from '../../infrastructure/database/schemas/agency.js';
import { users } from '../../infrastructure/database/schemas/users.js';

export const bankAccounts = pgTable('bank_accounts', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    accountNumber: text('account_number').notNull(),
    bankName: text('bank_name').notNull(),
    currencyId: uuid('currency_id'), // referencing public.currencies
    currentBalance: numeric('current_balance', { precision: 15, scale: 2 }).default('0'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bankTransactions = pgTable('bank_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    bankAccountId: uuid('bank_account_id').references(() => bankAccounts.id).notNull(),
    transactionDate: date('transaction_date').notNull(),
    transactionType: text('transaction_type').notNull(), // debit, credit
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    balanceAfter: numeric('balance_after', { precision: 15, scale: 2 }),
    description: text('description'),
    referenceNumber: text('reference_number'),
    category: text('category'),
    reconciled: boolean('reconciled').default(false),
    reconciliationId: uuid('reconciliation_id'), // self reference to bankReconciliations
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const bankReconciliations = pgTable('bank_reconciliations', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    bankAccountId: uuid('bank_account_id').references(() => bankAccounts.id).notNull(),
    reconciliationDate: date('reconciliation_date').notNull(),
    statementBalance: numeric('statement_balance', { precision: 15, scale: 2 }).notNull(),
    bookBalance: numeric('book_balance', { precision: 15, scale: 2 }).notNull(),
    status: text('status').default('pending').notNull(), // pending, reconciled
    notes: text('notes'),
    reconciledBy: uuid('reconciled_by').references(() => users.id),
    reconciledAt: timestamp('reconciled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const budgets = pgTable('budgets', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    budgetName: text('budget_name').notNull(),
    budgetType: text('budget_type').notNull(),
    fiscalYear: text('fiscal_year').notNull(),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    departmentId: uuid('department_id'),
    projectId: uuid('project_id'),
    totalBudget: numeric('total_budget', { precision: 15, scale: 2 }).notNull(),
    spentAmount: numeric('spent_amount', { precision: 15, scale: 2 }).default('0'),
    status: text('status').default('draft').notNull(), // draft, active, closed
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const budgetItems = pgTable('budget_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    budgetId: uuid('budget_id').references(() => budgets.id, { onDelete: 'cascade' }).notNull(),
    accountId: uuid('account_id'),
    category: text('category'),
    description: text('description'),
    budgetedAmount: numeric('budgeted_amount', { precision: 15, scale: 2 }).notNull(),
    spentAmount: numeric('spent_amount', { precision: 15, scale: 2 }).default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const journalEntries = pgTable('journal_entries', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    entryNumber: text('entry_number').notNull(),
    date: date('date').notNull(),
    description: text('description').notNull(),
    totalDebit: numeric('total_debit', { precision: 15, scale: 2 }).notNull(),
    totalCredit: numeric('total_credit', { precision: 15, scale: 2 }).notNull(),
    status: text('status').default('draft').notNull(), // draft, posted, reversed
    referenceId: uuid('reference_id'),
    referenceType: text('reference_type'),
    createdBy: uuid('created_by').references(() => users.id),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
