import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';
import { 
    bankAccounts, bankTransactions, bankReconciliations, 
    budgets, budgetItems 
} from './schema.js';
import { currencies } from '../../infrastructure/database/schemas/public.js';
import { 
    NewBankAccount, NewBankTransaction, NewBankReconciliation,
    NewBudget, NewBudgetItem, BudgetFilters, UnreconciledFilters
} from './types.js';

export class FinanceService {
    constructor(
        private db: NodePgDatabase<any> | any,
        private agencyId: string
    ) { }

    // --- CURRENCIES ---
    
    async getCurrencies() {
        return await this.db.select().from(currencies).where(eq(currencies.isActive, true));
    }

    async getBaseCurrency() {
        const [base] = await this.db.select().from(currencies).where(and(eq(currencies.isBase, true), eq(currencies.isActive, true)));
        return base;
    }

    // --- BANK ACCOUNTS ---

    async getBankAccounts() {
        return await this.db.select().from(bankAccounts).where(eq(bankAccounts.agencyId, this.agencyId));
    }

    async createBankAccount(data: NewBankAccount) {
        const [account] = await this.db.insert(bankAccounts).values({
            ...data,
            agencyId: this.agencyId
        }).returning();
        return account;
    }

    // --- BANK RECONCILIATION ---

    async getUnreconciledTransactions(filters: UnreconciledFilters) {
        const conditions = [
            eq(bankTransactions.agencyId, this.agencyId),
            eq(bankTransactions.reconciled, false)
        ];
        
        if (filters.bankAccountId) {
            conditions.push(eq(bankTransactions.bankAccountId, filters.bankAccountId));
        }
        if (filters.startDate) {
            conditions.push(gte(bankTransactions.transactionDate, filters.startDate));
        }
        if (filters.endDate) {
            conditions.push(lte(bankTransactions.transactionDate, filters.endDate));
        }

        return await this.db.select().from(bankTransactions).where(and(...conditions)).orderBy(desc(bankTransactions.transactionDate));
    }

    async reconcileTransactions(accountId: string, transactionIds: string[], statementBalance: string, userId: string) {
        return await this.db.transaction(async (tx: any) => {
            // Get book balance
            const [account] = await tx.select().from(bankAccounts).where(and(eq(bankAccounts.id, accountId), eq(bankAccounts.agencyId, this.agencyId)));
            if (!account) throw new Error('Bank account not found');

            // Create reconciliation record
            const [reconciliation] = await tx.insert(bankReconciliations).values({
                agencyId: this.agencyId,
                bankAccountId: accountId,
                reconciliationDate: new Date().toISOString().split('T')[0],
                statementBalance,
                bookBalance: account.currentBalance || '0',
                status: 'reconciled',
                reconciledBy: userId,
                reconciledAt: new Date()
            }).returning();

            // Mark transactions as reconciled
            if (transactionIds.length > 0) {
                // Not the most efficient for many IDs, but simple for now
                for (const txId of transactionIds) {
                    await tx.update(bankTransactions).set({
                        reconciled: true,
                        reconciliationId: reconciliation.id
                    }).where(and(
                        eq(bankTransactions.id, txId),
                        eq(bankTransactions.agencyId, this.agencyId)
                    ));
                }
            }

            return reconciliation;
        });
    }

    // --- BUDGETS ---

    async getBudgets(filters?: BudgetFilters) {
        const conditions = [eq(budgets.agencyId, this.agencyId)];
        
        if (filters?.fiscalYear) {
            conditions.push(eq(budgets.fiscalYear, filters.fiscalYear));
        }
        if (filters?.status) {
            conditions.push(eq(budgets.status, filters.status));
        }

        return await this.db.select().from(budgets).where(and(...conditions)).orderBy(desc(budgets.createdAt));
    }

    async getBudget(id: string) {
        const [budget] = await this.db.select().from(budgets).where(and(eq(budgets.id, id), eq(budgets.agencyId, this.agencyId)));
        if (!budget) throw new Error('Budget not found');
        return budget;
    }

    async createBudget(budgetData: NewBudget, itemsData: NewBudgetItem[]) {
        return await this.db.transaction(async (tx: any) => {
            const [budget] = await tx.insert(budgets).values({
                ...budgetData,
                agencyId: this.agencyId
            }).returning();

            if (itemsData && itemsData.length > 0) {
                const itemsToInsert = itemsData.map(item => ({
                    ...item,
                    budgetId: budget.id
                }));
                await tx.insert(budgetItems).values(itemsToInsert);
            }

            return budget;
        });
    }

    async getBudgetItems(budgetId: string) {
        // First verify budget belongs to agency
        await this.getBudget(budgetId);
        return await this.db.select().from(budgetItems).where(eq(budgetItems.budgetId, budgetId));
    }
}
