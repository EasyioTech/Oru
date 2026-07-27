import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { 
    bankAccounts, 
    bankTransactions, 
    bankReconciliations, 
    budgets, 
    budgetItems, 
    journalEntries 
} from './schema.js';
import { currencies } from '../../infrastructure/database/schemas/public.js';

export type Currency = InferSelectModel<typeof currencies>;

export type BankAccount = InferSelectModel<typeof bankAccounts>;
export type NewBankAccount = InferInsertModel<typeof bankAccounts>;

export type BankTransaction = InferSelectModel<typeof bankTransactions>;
export type NewBankTransaction = InferInsertModel<typeof bankTransactions>;

export type BankReconciliation = InferSelectModel<typeof bankReconciliations>;
export type NewBankReconciliation = InferInsertModel<typeof bankReconciliations>;

export type Budget = InferSelectModel<typeof budgets>;
export type NewBudget = InferInsertModel<typeof budgets>;

export type BudgetItem = InferSelectModel<typeof budgetItems>;
export type NewBudgetItem = InferInsertModel<typeof budgetItems>;

export type JournalEntry = InferSelectModel<typeof journalEntries>;
export type NewJournalEntry = InferInsertModel<typeof journalEntries>;

export interface BudgetFilters {
    fiscalYear?: string;
    status?: string;
}

export interface UnreconciledFilters {
    bankAccountId?: string;
    startDate?: string;
    endDate?: string;
}
