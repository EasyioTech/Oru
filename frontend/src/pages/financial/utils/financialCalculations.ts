/**
 * Financial calculation utilities
 * Helper functions for financial calculations and balance computations
 */

export interface AccountBalance {
  account_id: string;
  account_type: string;
  total_debits: number;
  total_credits: number;
}

/**
 * Calculate account balance based on account type
 * For asset and expense: balance = debits - credits
 * For liability, equity, revenue: balance = credits - debits
 */
export const calculateAccountBalance = (
  accountType: string,
  totalDebits: number,
  totalCredits: number
): number => {
  const debits = parseFloat(String(totalDebits || 0)) || 0;
  const credits = parseFloat(String(totalCredits || 0)) || 0;
  if (accountType === 'asset' || accountType === 'expense') {
    return debits - credits;
  } else {
    return credits - debits;
  }
};

/**
 * Calculate balances for all accounts
 */
export const calculateAccountBalances = (balancesData: any): Record<string, number> => {
  const balances: Record<string, number> = {};
  const safeData = Array.isArray(balancesData) ? balancesData : (balancesData?.data || []);
  if (!Array.isArray(safeData)) return balances;
  
  safeData.forEach((row) => {
    if (!row || !row.account_id) return;
    const { account_id, account_type, total_debits, total_credits } = row;
    balances[account_id] = calculateAccountBalance(account_type, total_debits, total_credits);
  });
  
  return balances;
};

/**
 * Calculate ledger summary from transactions
 */
export const calculateLedgerSummary = (transactions: any) => {
  const safeTxns = Array.isArray(transactions) ? transactions : (transactions?.data || []);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTxns = safeTxns.filter((t: any) => {
    if (!t || !t.date) return false;
    const tDate = new Date(t.date);
    if (isNaN(tDate.getTime())) return false;
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTxns
    .filter((t: any) => t?.type === 'credit')
    .reduce((sum: number, t: any) => sum + (parseFloat(t?.amount || 0) || 0), 0);
  
  const monthlyExpenses = monthlyTxns
    .filter((t: any) => t?.type === 'debit')
    .reduce((sum: number, t: any) => sum + (parseFloat(t?.amount || 0) || 0), 0);

  const totalBalance = safeTxns.reduce((sum: number, t: any) => {
    const amt = parseFloat(t?.amount || 0) || 0;
    return sum + (t?.type === 'credit' ? amt : -amt);
  }, 0);

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    netProfit: monthlyIncome - monthlyExpenses
  };
};

/**
 * Calculate accounting stats from accounts and balances
 */
export const calculateAccountingStats = (
  chartOfAccounts: any,
  accountBalances: any,
  ledgerSummary: any
) => {
  const safeAccounts = Array.isArray(chartOfAccounts) 
    ? chartOfAccounts 
    : (chartOfAccounts?.data && Array.isArray(chartOfAccounts.data) ? chartOfAccounts.data : []);
  const safeBalances = (accountBalances && typeof accountBalances === 'object') ? accountBalances : {};
  const safeLedger = (ledgerSummary && typeof ledgerSummary === 'object') 
    ? ledgerSummary 
    : { totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0, netProfit: 0 };

  const assets = safeAccounts
    .filter((acc: any) => acc && acc.account_type === 'asset')
    .reduce((sum: number, acc: any) => sum + (safeBalances[acc.id] || 0), 0);
  
  const liabilities = safeAccounts
    .filter((acc: any) => acc && acc.account_type === 'liability')
    .reduce((sum: number, acc: any) => sum + (safeBalances[acc.id] || 0), 0);
  
  const equity = safeAccounts
    .filter((acc: any) => acc && acc.account_type === 'equity')
    .reduce((sum: number, acc: any) => sum + (safeBalances[acc.id] || 0), 0);
  
  const revenue = safeLedger.monthlyIncome || 0;

  return {
    totalAssets: assets,
    totalLiabilities: liabilities,
    totalEquity: equity,
    monthlyRevenue: revenue,
  };
};

/**
 * Calculate job stats
 */
export const calculateJobStats = (jobs: any) => {
  const safeJobs = Array.isArray(jobs) 
    ? jobs 
    : (jobs?.data && Array.isArray(jobs.data) ? jobs.data : []);
  return {
    totalJobs: safeJobs.length,
    activeJobs: safeJobs.filter((job: any) => job && job.status === 'in_progress').length,
    totalBudget: safeJobs.reduce((sum: number, job: any) => sum + (parseFloat(job?.budget || 0) || 0), 0),
    actualCosts: safeJobs.reduce((sum: number, job: any) => sum + (parseFloat(job?.actual_cost || 0) || 0), 0),
  };
};
