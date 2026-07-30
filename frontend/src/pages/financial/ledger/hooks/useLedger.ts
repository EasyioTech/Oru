import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { selectRecords, selectOne } from '@/services/api/core';
import { logDebug, logWarn, logError } from '@/utils/consoleLogger';
import { type Transaction, type LedgerSummary, EMPTY_SUMMARY } from '../types';
import { formatCurrency } from '../utils';

export function useLedger() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummary>(EMPTY_SUMMARY);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLedgerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let agencyId = profile?.agency_id;
      if (!agencyId && user?.id) {
        try {
          const userProfile = await selectOne('profiles', { user_id: user.id });
          agencyId = userProfile?.agency_id;
        } catch (err) { logWarn('Could not fetch profile:', err); }
      }

      const entries = await selectRecords('journal_entries', {
        where: { status: 'posted' }, orderBy: 'entry_date DESC', limit: 500,
      }).catch((err: any) => {
        if ((err as { code?: string })?.code === '42P01') return [];
        throw err;
      });

      logDebug('Fetched journal entries:', entries?.length || 0, 'entries');

      if (!entries || entries.length === 0) {
        setTransactions([]); setLedgerSummary(EMPTY_SUMMARY); setLoading(false); return;
      }

      const agencyEntries = (entries || []).filter((e: any) => !agencyId || !e.agency_id || e.agency_id === agencyId);
      const entryIds = agencyEntries.map((e: any) => e.id) || [];
      let lines: any[] = [];

      if (entryIds.length > 0) {
        lines = await selectRecords('journal_entry_lines', {
          filters: [{ column: 'journal_entry_id', operator: 'in', value: entryIds }],
        }).catch((err: any) => {
          if ((err as { code?: string })?.code === '42P01') return [];
          throw err;
        });
      }

      let accounts: any[] = [];
      try {
        const where: Record<string, any> = { is_active: true };
        if (agencyId) where.agency_id = agencyId;
        accounts = await selectRecords('chart_of_accounts', { where, orderBy: 'account_code ASC' });
      } catch (err: any) {
        if ((err as { code?: string })?.code === '42703' || String((err as Error)?.message || '').includes('agency_id')) {
          logWarn('chart_of_accounts has no agency_id column, falling back to global accounts');
          accounts = await selectRecords('chart_of_accounts', { where: { is_active: true }, orderBy: 'account_code ASC' });
        } else throw err;
      }

      const accountMap = new Map((accounts || []).map((acc: any) => [(acc as { id: string }).id, acc]));
      let totalBalance = 0;
      const accountBalances: Record<string, number> = {};

      lines.forEach((line: any) => {
        const l = line as { account_id?: string; debit_amount?: number; credit_amount?: number };
        if (!l?.account_id) return;
        const account = accountMap.get(l.account_id) as { account_type?: string } | undefined;
        if (!account) return;
        const accountType = String(account.account_type || '').toLowerCase();
        const debit = parseFloat(String(l.debit_amount || 0));
        const credit = parseFloat(String(l.credit_amount || 0));
        if (!accountBalances[l.account_id]) accountBalances[l.account_id] = 0;
        if (accountType === 'asset' || accountType === 'expense')
          accountBalances[l.account_id] += (debit - credit);
        else
          accountBalances[l.account_id] += (credit - debit);
      });

      Object.entries(accountBalances).forEach(([accountId, balance]) => {
        const account = accountMap.get(accountId) as { account_type?: string } | undefined;
        if (account && String(account.account_type || '').toLowerCase() === 'asset') totalBalance += balance;
      });

      const transformedTransactions: Transaction[] = [];
      let runningBalance = 0;

      agencyEntries.forEach((entry: any) => {
        const e = entry as { id?: string; entry_date?: string; created_at?: string; description?: string; reference?: string; entry_number?: string };
        if (!e?.id) return;
        const entryLines = lines.filter((l: any) => l && (l as { journal_entry_id?: string }).journal_entry_id === e.id);

        entryLines.forEach((line: any) => {
          const l = line as { id?: string; account_id?: string; credit_amount?: number; debit_amount?: number; description?: string };
          if (!l?.id) return;
          const account = l.account_id ? (accountMap.get(l.account_id) as { account_type?: string } | undefined) : null;
          const isCredit = (l.credit_amount || 0) > 0;
          const amount = isCredit ? (l.credit_amount || 0) : (l.debit_amount || 0);

          if (amount > 0) {
            runningBalance += isCredit ? amount : -amount;
            let category = 'Other';
            if (account?.account_type) {
              const t = String(account.account_type).toLowerCase();
              if (t.includes('revenue') || t.includes('income')) category = 'Revenue';
              else if (t.includes('expense')) category = 'Operating Expenses';
              else if (t.includes('payroll') || t.includes('salary')) category = 'Payroll';
            }
            transformedTransactions.push({
              id: String(l.id),
              date: e.entry_date || e.created_at || new Date().toISOString(),
              description: l.description || e.description || 'Transaction',
              category,
              type: isCredit ? 'credit' : 'debit',
              amount,
              balance: runningBalance,
              reference: e.reference || e.entry_number || `JE-${String(e.id).substring(0, 8)}`,
            });
          }
        });
      });

      transformedTransactions.sort((a, b) => {
        try { return new Date(b.date).getTime() - new Date(a.date).getTime(); } catch { return 0; }
      });

      setTransactions(transformedTransactions);

      const now = new Date();
      const monthly = transformedTransactions.filter(t => {
        try { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }
        catch { return false; }
      });

      const monthlyIncome = monthly.filter(t => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0);
      const monthlyExpenses = monthly.filter(t => t.type === 'debit').reduce((s, t) => s + (t.amount || 0), 0);
      setLedgerSummary({ totalBalance: totalBalance || 0, monthlyIncome, monthlyExpenses, netProfit: monthlyIncome - monthlyExpenses });
    } catch (err: any) {
      logError('Error fetching ledger data:', err);
      const msg = (err as Error)?.message || 'Failed to load ledger data. Please try again.';
      setError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [profile?.agency_id, user?.id, toast]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchLedgerData(); }, 100);
    return () => clearTimeout(timer);
  }, [fetchLedgerData]);

  const handleExportLedger = () => {
    try {
      const headers = ['Date', 'Reference', 'Description', 'Category', 'Type', 'Amount', 'Balance'];
      const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString(), t.reference, t.description, t.category,
        t.type.toUpperCase(),
        (typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0).toFixed(2),
        (typeof t.balance === 'number' ? t.balance : parseFloat(t.balance) || 0).toFixed(2),
      ]);
      const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: 'Success', description: 'Ledger exported successfully' });
    } catch (err: any) {
      logError('Error exporting ledger:', err);
      toast({ title: 'Error', description: 'Failed to export ledger. Please try again.', variant: 'destructive' });
    }
  };

  const handleAddTransaction = () => { navigate('/ledger/create-entry'); };

  const filteredTransactions = transactions.filter(t => {
    if (!t) return false;
    const q = searchTerm.toLowerCase();
    return (t.description || '').toLowerCase().includes(q)
      || (t.reference || '').toLowerCase().includes(q)
      || (t.category || '').toLowerCase().includes(q);
  });

  return {
    loading, error, ledgerSummary, filteredTransactions,
    searchTerm, setSearchTerm, profile,
    fetchLedgerData, handleExportLedger, handleAddTransaction,
    formatCurrency,
  };
}
