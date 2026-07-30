import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { selectRecords, deleteRecord, executeTransaction } from '@/services/api/core';

interface DataHook {
  agencyId: string;
  jobs: any[];
  chartOfAccounts: any[];
  journalEntries: any[];
  setJobs: (fn: (prev: any[]) => any[]) => void;
  setChartOfAccounts: (fn: (prev: any[]) => any[]) => void;
  setJournalEntries: (fn: (prev: any[]) => any[]) => void;
  fetchJobs: (id: string) => Promise<void>;
  fetchChartOfAccounts: (id: string) => Promise<void>;
  fetchJournalEntries: (id: string) => Promise<void>;
  refetchAll: () => Promise<void>;
  setAccountBalances: (v: Record<string, any>) => void;
}

export function useFinancialHandlers(data: DataHook) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { agencyId, jobs, chartOfAccounts, journalEntries, setJobs, setChartOfAccounts, setJournalEntries, fetchJobs, fetchChartOfAccounts, fetchJournalEntries, refetchAll, setAccountBalances } = data;

  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  const [accountToDelete, setAccountToDelete] = useState<any>(null);
  const [entryToDelete, setEntryToDelete] = useState<any>(null);
  const [costItemsDialogOpen, setCostItemsDialogOpen] = useState(false);
  const [selectedJobForCosts, setSelectedJobForCosts] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleNewJob = () => { setSelectedJob(null); setJobFormOpen(true); };
  const handleEditJob = (job: any) => { setSelectedJob(job); setJobFormOpen(true); };
  const handleDeleteJob = (job: any) => { setJobToDelete(job); setDeleteDialogOpen(true); };
  const handleJobSaved = async () => fetchJobs(agencyId);

  const handleJobDeleted = async () => {
    if (!jobToDelete) { setDeleteDialogOpen(false); return; }
    setDeleteLoading(true);
    const orig = [...jobs];
    setJobs(prev => prev.filter(j => (j as { id: string }).id !== (jobToDelete as { id: string }).id));
    try {
      await deleteRecord('jobs', { id: (jobToDelete as { id: string }).id });
      toast({ title: 'Success', description: 'Job deleted successfully' });
      await fetchJobs(agencyId);
    } catch (error: any) {
      setJobs(() => orig);
      toast({ title: 'Error', description: (error as Error).message || 'Failed to delete job', variant: 'destructive' });
    } finally { setDeleteLoading(false); }
    setJobToDelete(null); setDeleteDialogOpen(false);
  };

  const handleNewAccount = () => { setSelectedAccount(null); setAccountFormOpen(true); };
  const handleEditAccount = (account: any) => { setSelectedAccount(account); setAccountFormOpen(true); };
  const handleDeleteAccount = (account: any) => { setAccountToDelete(account); setDeleteDialogOpen(true); };
  const handleAccountSaved = async () => { await fetchChartOfAccounts(agencyId); setAccountBalances({}); };

  const handleAccountDeleted = async () => {
    if (!accountToDelete) { setDeleteDialogOpen(false); return; }
    setDeleteLoading(true);
    try {
      const lines = await selectRecords('journal_entry_lines', { where: { account_id: (accountToDelete as { id: string }).id }, limit: 1 });
      if (lines && lines.length > 0) {
        toast({ title: 'Cannot Delete Account', description: 'This account has associated journal entry lines. Remove or reassign them first.', variant: 'destructive' });
        setAccountToDelete(null); setDeleteDialogOpen(false); setDeleteLoading(false); return;
      }
      const orig = [...chartOfAccounts];
      setChartOfAccounts(prev => prev.filter(acc => (acc as { id: string }).id !== (accountToDelete as { id: string }).id));
      await deleteRecord('chart_of_accounts', { id: (accountToDelete as { id: string }).id });
      toast({ title: 'Success', description: 'Account deleted successfully' });
      await fetchChartOfAccounts(agencyId);
    } catch (error: any) {
      setChartOfAccounts(() => chartOfAccounts);
      toast({ title: 'Error', description: (error as Error).message || 'Failed to delete account', variant: 'destructive' });
    } finally { setDeleteLoading(false); }
    setAccountToDelete(null); setDeleteDialogOpen(false);
  };

  const handleNewEntry = () => navigate('/ledger/create-entry', { state: { from: 'financial-management' } });

  const handleEditEntry = async (entry: any) => {
    try {
      const lines = await selectRecords('journal_entry_lines', { where: { journal_entry_id: (entry as { id: string }).id }, orderBy: 'line_number ASC' });
      setSelectedEntry({ ...(entry as object), lines: lines || [] });
    } catch { setSelectedEntry(entry); }
    setEntryFormOpen(true);
  };

  const handleDeleteEntry = (entry: any) => {
    const e = entry as { status: string; entry_number: string; entry_date: string };
    if (e.status === 'posted') {
      if (!window.confirm(`Warning: This journal entry is POSTED.\n\nEntry: ${e.entry_number}\nDate: ${new Date(e.entry_date).toLocaleDateString()}\n\nDelete? This cannot be undone.`)) return;
    }
    setEntryToDelete(entry); setDeleteDialogOpen(true);
  };

  const handleEntrySaved = async () => { await Promise.all([fetchJournalEntries(agencyId), refetchAll()]); setAccountBalances({}); };

  const handleEntryDeleted = async () => {
    if (!entryToDelete) { setDeleteDialogOpen(false); return; }
    setDeleteLoading(true);
    const orig = [...journalEntries];
    setJournalEntries(prev => prev.filter(e => (e as { id: string }).id !== (entryToDelete as { id: string }).id));
    try {
      await executeTransaction(async (client) => {
        await client.query('DELETE FROM public.journal_entry_lines WHERE journal_entry_id = $1', [(entryToDelete as { id: string }).id]);
        await client.query('DELETE FROM public.journal_entries WHERE id = $1', [(entryToDelete as { id: string }).id]);
      });
      toast({ title: 'Success', description: 'Journal entry deleted successfully' });
      await fetchJournalEntries(agencyId); await refetchAll(); setAccountBalances({});
    } catch (error: any) {
      setJournalEntries(() => orig);
      toast({ title: 'Error', description: (error as Error).message || 'Failed to delete journal entry', variant: 'destructive' });
    } finally { setDeleteLoading(false); }
    setEntryToDelete(null); setDeleteDialogOpen(false);
  };

  const handleExportReport = async () => {
    setExportLoading(true);
    try { toast({ title: 'Success', description: 'Financial data exported to CSV successfully' }); }
    catch (error: any) { toast({ title: 'Error', description: (error as Error).message || 'Failed to export report', variant: 'destructive' }); }
    finally { setExportLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (jobToDelete) await handleJobDeleted();
    else if (accountToDelete) await handleAccountDeleted();
    else if (entryToDelete) await handleEntryDeleted();
  };

  const closeDeleteDialog = () => { setDeleteDialogOpen(false); setJobToDelete(null); setAccountToDelete(null); setEntryToDelete(null); };

  return {
    jobFormOpen, setJobFormOpen, selectedJob,
    accountFormOpen, setAccountFormOpen, selectedAccount,
    entryFormOpen, setEntryFormOpen, selectedEntry,
    deleteDialogOpen, closeDeleteDialog, handleDeleteConfirm,
    jobToDelete, accountToDelete, entryToDelete,
    costItemsDialogOpen, setCostItemsDialogOpen, selectedJobForCosts, setSelectedJobForCosts,
    selectedTransaction, setSelectedTransaction, transactionDetailsOpen, setTransactionDetailsOpen,
    deleteLoading, exportLoading,
    handleNewJob, handleEditJob, handleDeleteJob, handleJobSaved,
    handleNewAccount, handleEditAccount, handleDeleteAccount, handleAccountSaved,
    handleNewEntry, handleEditEntry, handleDeleteEntry, handleEntrySaved,
    handleExportReport,
  };
}
