import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Download, Loader2, Plus } from 'lucide-react';
import PayrollFormDialog from '@/components/shared/PayrollFormDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import PayrollPeriodFormDialog from '@/components/PayrollPeriodFormDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { usePayroll } from './payroll-page/usePayroll';
import { PayrollStatsCards } from './payroll-page/components/PayrollStatsCards';
import { PayrollRecordsTab } from './payroll-page/components/PayrollRecordsTab';
import { PeriodsTab } from './payroll-page/components/PeriodsTab';

const Payroll = () => {
  const ctx = usePayroll();

  if (ctx.loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading payroll data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payroll"
        description={ctx.urlDepartmentName ? `Payroll for ${decodeURIComponent(ctx.urlDepartmentName)} department` : 'Manage employee compensation and payroll processing'}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="h-8 sm:h-9 gap-1 text-xs sm:text-sm" onClick={ctx.handleNewPeriod}><Plus className="h-3.5 w-3.5" />Period</Button>
            <Button size="sm" variant="outline" className="h-8 sm:h-9 gap-1 text-xs sm:text-sm" onClick={ctx.handleNewPayroll}><Plus className="h-3.5 w-3.5" />Payroll</Button>
            <Button size="sm" variant="outline" className="h-8 sm:h-9 gap-1 text-xs sm:text-sm" onClick={ctx.handleExportReport}><Download className="h-3.5 w-3.5" />Export</Button>
          </div>
        }
      />

      <PayrollStatsCards summary={ctx.payrollSummary} />

      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
          <TabsTrigger value="periods">Payroll Periods</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollRecordsTab
            loading={ctx.loading}
            filteredRecords={ctx.filteredRecords}
            searchTerm={ctx.searchTerm}
            setSearchTerm={ctx.setSearchTerm}
            selectedPeriod={ctx.selectedPeriod}
            setSelectedPeriod={ctx.setSelectedPeriod}
            payrollPeriods={ctx.payrollPeriods}
            selectedRecords={ctx.selectedRecords}
            bulkActionLoading={ctx.bulkActionLoading}
            onSelectRecord={ctx.handleSelectRecord}
            onSelectAll={ctx.handleSelectAll}
            onBulkApprove={ctx.handleBulkApprove}
            onBulkMarkPaid={ctx.handleBulkMarkPaid}
            onNewPayroll={ctx.handleNewPayroll}
            onEditPayroll={ctx.handleEditPayroll}
            onDeletePayroll={ctx.handleDeletePayroll}
            onDownloadPaySlip={ctx.handleDownloadPaySlip}
          />
        </TabsContent>

        <TabsContent value="periods" className="space-y-4">
          <PeriodsTab
            payrollPeriods={ctx.payrollPeriods}
            onNewPeriod={ctx.handleNewPeriod}
            onEditPeriod={ctx.handleEditPeriod}
            onDeletePeriod={ctx.handleDeletePeriod}
          />
        </TabsContent>
      </Tabs>

      <PayrollFormDialog
        isOpen={ctx.payrollFormOpen}
        onClose={() => ctx.setPayrollFormOpen(false)}
        payroll={ctx.selectedPayroll}
        onPayrollSaved={ctx.handlePayrollSaved}
        payrollPeriodId={ctx.selectedPeriod}
      />

      <PayrollPeriodFormDialog
        isOpen={ctx.periodFormOpen}
        onClose={() => ctx.setPeriodFormOpen(false)}
        period={ctx.selectedPeriodObj}
        onPeriodSaved={ctx.handlePeriodSaved}
      />

      <DeleteConfirmDialog
        isOpen={ctx.deleteDialogOpen}
        onClose={() => { ctx.setDeleteDialogOpen(false); ctx.setItemToDelete(null); }}
        onDeleted={ctx.handleDeleted}
        itemType={ctx.itemToDelete?.type === 'payroll' ? 'Payroll Record' : 'Payroll Period'}
        itemName={(ctx.itemToDelete?.item as { employee?: string; name?: string })?.employee || (ctx.itemToDelete?.item as { name?: string })?.name || ''}
        itemId={(ctx.itemToDelete?.item as { id?: string })?.id || ''}
        tableName={ctx.itemToDelete?.type === 'payroll' ? 'payroll' : 'payroll_periods'}
      />
    </div>
  );
};

export default Payroll;
