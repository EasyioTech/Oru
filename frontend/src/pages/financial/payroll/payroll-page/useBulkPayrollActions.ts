import { useState } from 'react';
import { updateRecord } from '@/services/api/core';

type ToastFn = (opts: { title: string; description: string; variant?: 'default' | 'destructive' }) => void;

interface BulkActionsParams {
  filteredRecords: { id: string }[];
  fetchPayrollData: () => void;
  userId: string | undefined;
  toast: ToastFn;
}

export function useBulkPayrollActions({ filteredRecords, fetchPayrollData, userId, toast }: BulkActionsParams) {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleSelectRecord = (id: string) => {
    setSelectedRecords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) setSelectedRecords(new Set());
    else setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
  };

  const handleBulkApprove = async () => {
    if (selectedRecords.size === 0) {
      toast({ title: 'No Selection', description: 'Please select at least one payroll record', variant: 'destructive' });
      return;
    }
    setBulkActionLoading(true);
    try {
      await Promise.all(Array.from(selectedRecords).map(id => updateRecord('payroll', { status: 'approved' }, { id }, userId)));
      toast({ title: 'Success', description: `${selectedRecords.size} payroll record(s) approved successfully` });
      setSelectedRecords(new Set());
      fetchPayrollData();
    } catch (error: any) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to approve payroll records', variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkMarkPaid = async () => {
    if (selectedRecords.size === 0) {
      toast({ title: 'No Selection', description: 'Please select at least one payroll record', variant: 'destructive' });
      return;
    }
    setBulkActionLoading(true);
    try {
      await Promise.all(Array.from(selectedRecords).map(id =>
        updateRecord('payroll', { status: 'paid', paid_at: new Date().toISOString() }, { id }, userId)
      ));
      toast({ title: 'Success', description: `${selectedRecords.size} payroll record(s) marked as paid` });
      setSelectedRecords(new Set());
      fetchPayrollData();
    } catch (error: any) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to mark payroll records as paid', variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  return { selectedRecords, bulkActionLoading, handleSelectRecord, handleSelectAll, handleBulkApprove, handleBulkMarkPaid };
}
