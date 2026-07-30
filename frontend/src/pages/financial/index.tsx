import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BookOpen, FileText, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getAgencyId } from '@/utils/agencyUtils';

import { useFinancialData } from './hooks/useFinancialData';
import { useAccountBalances } from './hooks/useAccountBalances';
import { useFinancialReports } from './hooks/useFinancialReports';
import { useFinancialHandlers } from './hooks/useFinancialHandlers';
import { calculateLedgerSummary, calculateAccountingStats, calculateJobStats } from './utils/financialCalculations';

import { FinancialMetricsCards } from './components/FinancialMetricsCards';
import { FinancialFilters } from './components/FinancialFilters';
import { ChartOfAccountsTab } from './components/ChartOfAccountsTab';
import { JournalEntriesTab } from './components/JournalEntriesTab';
import { JobsTab } from './components/JobsTab';
import { TransactionsTab } from './components/TransactionsTab';
import { FinancialReportsTab } from './components/FinancialReportsTab';
import { ProjectsTab } from './components/ProjectsTab';
import { ReportViewDialog } from './components/ReportViewDialog';
import { TransactionDetailsDialog } from './components/TransactionDetailsDialog';


import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import ChartOfAccountFormDialog from '@/components/shared/ChartOfAccountFormDialog';
import JournalEntryFormDialog from '@/components/shared/JournalEntryFormDialog';
import JobCostItemsDialog from '@/components/JobCostItemsDialog';

const FinancialManagement = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize] = useState(10);

  const dataHook = useFinancialData(user, profile);
  const { agencyId, jobs, projects, chartOfAccounts, journalEntries, transactions, loading, refetchAll } = dataHook;
  const { accountBalances, setAccountBalances } = useAccountBalances(chartOfAccounts, agencyId);

  const ledgerSummary = useMemo(() => calculateLedgerSummary(transactions), [transactions]);
  const accountingStats = useMemo(() => calculateAccountingStats(chartOfAccounts, accountBalances, ledgerSummary), [chartOfAccounts, accountBalances, ledgerSummary]);
  const jobStats = useMemo(() => calculateJobStats(jobs), [jobs]);

  const { reportGenerating, reportViewOpen, reportViewData, setReportViewOpen, handleGenerateReport } =
    useFinancialReports(chartOfAccounts, accountBalances, jobs, ledgerSummary, accountingStats, agencyId, user?.id);

  const h = useFinancialHandlers({ ...dataHook, setAccountBalances });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleClearFilters = () => { setDateRange({ start: '', end: '' }); setAccountTypeFilter('all'); setStatusFilter('all'); setSearchTerm(''); };

  const agencyDatabase = typeof window !== 'undefined' ? localStorage.getItem('agency_database') : null;
  if (!agencyId && !agencyDatabase && !loading && user?.id) {
    return (
      <div className="container mx-auto p-6">
        <Card><CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Unable to determine agency. Please ensure you are logged in and have an agency assigned.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={async () => {
              const id = localStorage.getItem('agency_id') || (agencyDatabase ? '00000000-0000-0000-0000-000000000000' : await getAgencyId(profile, user?.id));
              if (id || agencyDatabase) await refetchAll();
              else toast({ title: 'Error', description: 'Could not find agency. Log out and back in.', variant: 'destructive' });
            }}>Retry</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Financial Management"
        description="Complete financial oversight: accounting, job costing, and general ledger"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="h-8 sm:h-9 gap-1 text-xs sm:text-sm" onClick={() => navigate('/ledger')}><BookOpen className="h-3.5 w-3.5" />Ledger</Button>
            <Button size="sm" variant="outline" className="h-8 sm:h-9 gap-1 text-xs sm:text-sm" onClick={() => navigate('/reports')}><FileText className="h-3.5 w-3.5" />Reports</Button>
            <Button size="sm" variant="outline" className="h-8 sm:h-9 gap-1 text-xs sm:text-sm" onClick={h.handleExportReport} disabled={h.exportLoading}><Download className="h-3.5 w-3.5" />{h.exportLoading ? 'Exporting…' : 'Export'}</Button>
            <Button size="sm" className="h-8 sm:h-9 gap-1 text-xs sm:text-sm" onClick={h.handleNewEntry}><Plus className="h-3.5 w-3.5" />New Entry</Button>
          </div>
        }
      />

      <FinancialMetricsCards totalAssets={accountingStats.totalAssets} currentBalance={ledgerSummary.totalBalance} activeJobs={jobStats.activeJobs} netProfit={ledgerSummary.netProfit} />
      <FinancialFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} dateRange={dateRange} onDateRangeChange={setDateRange} accountTypeFilter={accountTypeFilter} onAccountTypeFilterChange={setAccountTypeFilter} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)} onClearFilters={handleClearFilters} />

      <Tabs defaultValue="accounting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="job-costing">Job Costing</TabsTrigger>
          <TabsTrigger value="ledger">General Ledger</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="accounting" className="space-y-4">
          <Tabs defaultValue="chart-of-accounts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chart-of-accounts">Chart of Accounts</TabsTrigger>
              <TabsTrigger value="journal-entries">Journal Entries</TabsTrigger>
            </TabsList>
            <TabsContent value="chart-of-accounts">
              <ChartOfAccountsTab chartOfAccounts={chartOfAccounts} accountBalances={accountBalances} loading={loading} searchTerm={debouncedSearchTerm} accountTypeFilter={accountTypeFilter} pageSize={pageSize} onNewAccount={h.handleNewAccount} onEditAccount={h.handleEditAccount} onDeleteAccount={h.handleDeleteAccount} deleteLoading={h.deleteLoading} />
            </TabsContent>
            <TabsContent value="journal-entries">
              <JournalEntriesTab journalEntries={journalEntries} loading={loading} searchTerm={debouncedSearchTerm} statusFilter={statusFilter} dateRange={dateRange} pageSize={pageSize} onNewEntry={h.handleNewEntry} onEditEntry={h.handleEditEntry} onDeleteEntry={h.handleDeleteEntry} deleteLoading={h.deleteLoading} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="job-costing" className="space-y-4">
          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
              <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs" className="space-y-4 mt-4">
              <JobsTab jobs={jobs} loading={loading} searchTerm={debouncedSearchTerm} statusFilter={statusFilter} dateRange={dateRange} pageSize={pageSize} onNewJob={h.handleNewJob} onEditJob={h.handleEditJob} onDeleteJob={h.handleDeleteJob} onManageCosts={(job) => { h.setSelectedJobForCosts(job); h.setCostItemsDialogOpen(true); }} deleteLoading={h.deleteLoading} />
            </TabsContent>
            <TabsContent value="projects" className="space-y-4 mt-4">
              <ProjectsTab projects={projects} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <TransactionsTab transactions={transactions} loading={loading} searchTerm={debouncedSearchTerm} dateRange={dateRange} pageSize={pageSize} ledgerSummary={ledgerSummary} onTransactionClick={(t) => { h.setSelectedTransaction(t); h.setTransactionDetailsOpen(true); }} />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReportsTab reportGenerating={reportGenerating} onGenerateReport={handleGenerateReport} />
        </TabsContent>
      </Tabs>

      <ChartOfAccountFormDialog isOpen={h.accountFormOpen} onClose={() => h.setAccountFormOpen(false)} account={h.selectedAccount} onAccountSaved={h.handleAccountSaved} />
      <JournalEntryFormDialog isOpen={h.entryFormOpen} onClose={() => h.setEntryFormOpen(false)} entry={h.selectedEntry} onEntrySaved={h.handleEntrySaved} />
      <DeleteConfirmDialog isOpen={h.deleteDialogOpen} onClose={h.closeDeleteDialog} onDeleted={h.handleDeleteConfirm} itemType={h.jobToDelete ? 'Job' : h.accountToDelete ? 'Account' : 'Journal Entry'} itemName={(h.jobToDelete as { title?: string })?.title || (h.accountToDelete as { account_name?: string })?.account_name || (h.entryToDelete as { entry_number?: string })?.entry_number || ''} itemId={(h.jobToDelete as { id?: string })?.id || (h.accountToDelete as { id?: string })?.id || (h.entryToDelete as { id?: string })?.id || ''} tableName={h.jobToDelete ? 'jobs' : h.accountToDelete ? 'chart_of_accounts' : 'journal_entries'} />
      <JobCostItemsDialog isOpen={h.costItemsDialogOpen} onClose={() => { h.setCostItemsDialogOpen(false); h.setSelectedJobForCosts(null); }} jobId={(h.selectedJobForCosts as { id?: string })?.id || ''} jobTitle={(h.selectedJobForCosts as { title?: string })?.title} onItemsUpdated={h.handleJobSaved} />

      <ReportViewDialog open={reportViewOpen} onOpenChange={setReportViewOpen} reportViewData={reportViewData} onNavigateReports={() => { setReportViewOpen(false); navigate('/reports'); }} />
      <TransactionDetailsDialog open={h.transactionDetailsOpen} onOpenChange={(open) => { h.setTransactionDetailsOpen(open); if (!open) h.setSelectedTransaction(null); }} transaction={h.selectedTransaction as Parameters<typeof TransactionDetailsDialog>[0]['transaction']} chartOfAccounts={chartOfAccounts as Parameters<typeof TransactionDetailsDialog>[0]['chartOfAccounts']} onEditEntry={h.handleEditEntry} />
    </div>
  );
};

export default FinancialManagement;
