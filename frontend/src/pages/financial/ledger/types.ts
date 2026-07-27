export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  reference: string;
}

export interface LedgerSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netProfit: number;
}

export const EMPTY_SUMMARY: LedgerSummary = {
  totalBalance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  netProfit: 0,
};
