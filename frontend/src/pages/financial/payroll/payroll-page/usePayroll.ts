import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { selectRecords, deleteRecord, selectOne } from '@/services/api/core';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { PayrollRecord, PayrollSummary } from './types';
import { generatePaySlipHTML } from './payrollUtils';
import { exportPayrollCSV } from './exportUtils';
import { useBulkPayrollActions } from './useBulkPayrollActions';

export function usePayroll() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const urlDepartmentId = searchParams.get('department');
  const urlDepartmentName = searchParams.get('name');

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary>({ totalEmployees: 0, totalPayroll: 0, averageSalary: 0, pendingPayroll: 0 });
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [payrollPeriods, setPayrollPeriods] = useState<unknown[]>([]);
  const [payrollFormOpen, setPayrollFormOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<unknown>(null);
  const [periodFormOpen, setPeriodFormOpen] = useState(false);
  const [selectedPeriodObj, setSelectedPeriodObj] = useState<unknown>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; item: unknown } | null>(null);

  const fetchPayrollPeriods = useCallback(async () => {
    try {
      const periods = await selectRecords('payroll_periods', { orderBy: 'end_date DESC' });
      setPayrollPeriods(periods || []);
      if (periods?.length > 0 && !selectedPeriod) setSelectedPeriod((periods[0] as { id: string }).id);
    } catch (error) {
      console.error('Error fetching payroll periods:', error);
    }
  }, [selectedPeriod]);

  const fetchPayrollData = useCallback(async () => {
    try {
      setLoading(true);
      let departmentUserIds: string[] = [];
      if (urlDepartmentId) {
        const assignments = await selectRecords('team_assignments', { where: { department_id: urlDepartmentId, is_active: true }, select: 'user_id' });
        departmentUserIds = (assignments || []).map((ta: unknown) => (ta as { user_id?: string }).user_id).filter(Boolean) as string[];
      }

      let periodId = selectedPeriod;
      if (!periodId && payrollPeriods.length > 0) {
        periodId = (payrollPeriods[0] as { id: string }).id;
        setSelectedPeriod(periodId);
      }

      let payrollData: unknown[] = [];
      if (periodId) {
        payrollData = await selectRecords('payroll', { where: { payroll_period_id: periodId }, orderBy: 'created_at DESC' });
      }

      if (urlDepartmentId && departmentUserIds.length > 0) {
        const employeeIds = payrollData.map((p: unknown) => (p as { employee_id?: string }).employee_id).filter(Boolean);
        if (employeeIds.length > 0) {
          const empList = await selectRecords('employee_details', { filters: [{ column: 'id', operator: 'in', value: employeeIds }] });
          const idToUserId = new Map(empList.map((e: unknown) => [(e as { id: string }).id, (e as { user_id: string }).user_id]));
          payrollData = payrollData.filter((p: unknown) => {
            const uid = idToUserId.get((p as { employee_id: string }).employee_id);
            return uid && departmentUserIds.includes(uid);
          });
        } else {
          payrollData = [];
        }
      }

      const employeeDetailIds = payrollData.map((p: unknown) => (p as { employee_id?: string }).employee_id).filter(Boolean);
      let employees: unknown[] = [];
      let profiles: unknown[] = [];
      if (employeeDetailIds.length > 0) {
        employees = await selectRecords('employee_details', { filters: [{ column: 'id', operator: 'in', value: employeeDetailIds }] });
        const userIds = employees.map((e: unknown) => (e as { user_id?: string }).user_id).filter(Boolean);
        if (userIds.length > 0) {
          profiles = await selectRecords('profiles', { filters: [{ column: 'user_id', operator: 'in', value: userIds }] });
        }
      }

      const profileMap = new Map(profiles.map((p: unknown) => [(p as { user_id: string }).user_id, (p as { full_name: string }).full_name]));
      const employeeMap = new Map(employees.map((e: unknown) => [(e as { id: string }).id, e as Record<string, unknown>]));
      const currentPeriod = (payrollPeriods.find((p: unknown) => (p as { id: string }).id === periodId) || payrollPeriods[0]) as Record<string, unknown> | undefined;

      const transformedRecords: PayrollRecord[] = payrollData.map((record: unknown) => {
        const r = record as Record<string, unknown>;
        const emp = employeeMap.get(r.employee_id as string);
        const fullName = emp?.user_id
          ? (profileMap.get(emp.user_id as string) || `${emp.first_name} ${emp.last_name}`.trim())
          : 'Unknown Employee';
        return {
          id: r.id as string,
          employee: fullName,
          position: (emp?.emp_position || emp?.employment_type || 'N/A') as string,
          baseSalary: Number(r.base_salary || 0),
          overtime: Number(r.overtime_pay || 0),
          deductions: Number(r.deductions || 0),
          netPay: Number(r.net_salary || r.net_pay || 0),
          status: (r.status || 'draft') as string,
          payPeriod: currentPeriod
            ? new Date(currentPeriod.start_date as string).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Current Period',
          employee_id: r.employee_id as string,
        };
      });

      setPayrollRecords(transformedRecords);
      const totalPayroll = transformedRecords.reduce((sum, r) => sum + r.netPay, 0);
      const activeEmployees = await selectRecords('employee_details', { where: { is_active: true } });
      setPayrollSummary({
        totalEmployees: activeEmployees?.length || 0,
        totalPayroll,
        averageSalary: Math.round(transformedRecords.length > 0 ? totalPayroll / transformedRecords.length : 0),
        pendingPayroll: transformedRecords.filter(r => r.status === 'draft').length,
      });
    } catch (error: unknown) {
      console.error('Error fetching payroll data:', error);
      toast({ title: 'Error', description: 'Failed to load payroll data. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [urlDepartmentId, selectedPeriod, payrollPeriods, toast]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPayrollData(); fetchPayrollPeriods(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (selectedPeriod) fetchPayrollData(); }, [selectedPeriod, urlDepartmentId]);

  const handleNewPayroll = () => { setSelectedPayroll(null); setPayrollFormOpen(true); };

  const handleEditPayroll = async (payroll: unknown) => {
    try {
      const fullRecord = await selectOne('payroll', { id: (payroll as { id: string }).id }) as Record<string, unknown>;
      if (fullRecord) {
        setSelectedPayroll({
          id: fullRecord.id,
          employee_id: fullRecord.employee_id,
          payroll_period_id: fullRecord.payroll_period_id,
          base_salary: parseFloat(String(fullRecord.base_salary || 0)),
          overtime_pay: parseFloat(String(fullRecord.overtime_pay || 0)),
          bonuses: parseFloat(String(fullRecord.allowances || 0)),
          deductions: parseFloat(String(fullRecord.deductions || 0)),
          gross_pay: parseFloat(String(fullRecord.gross_salary || fullRecord.gross_pay || 0)),
          tax_deductions: parseFloat(String(fullRecord.tax_amount || fullRecord.tax_deductions || 0)),
          net_pay: parseFloat(String(fullRecord.net_salary || fullRecord.net_pay || 0)),
          hours_worked: parseFloat(String(fullRecord.hours_worked || 0)),
          overtime_hours: parseFloat(String(fullRecord.overtime_hours || 0)),
          status: fullRecord.status,
          notes: fullRecord.notes || '',
        });
      }
      setPayrollFormOpen(true);
    } catch (error) {
      console.error('Error fetching payroll record:', error);
      toast({ title: 'Error', description: 'Failed to load payroll record details', variant: 'destructive' });
    }
  };

  const handleDeletePayroll = (payroll: unknown) => { setItemToDelete({ type: 'payroll', item: payroll }); setDeleteDialogOpen(true); };
  const handleNewPeriod = () => { setSelectedPeriodObj(null); setPeriodFormOpen(true); };
  const handleEditPeriod = (period: unknown) => { setSelectedPeriodObj(period); setPeriodFormOpen(true); };
  const handleDeletePeriod = (period: unknown) => { setItemToDelete({ type: 'period', item: period }); setDeleteDialogOpen(true); };
  const handlePayrollSaved = () => fetchPayrollData();
  const handlePeriodSaved = () => { fetchPayrollPeriods(); fetchPayrollData(); };

  const handleDeleted = async () => {
    if (!itemToDelete) return;
    try {
      const item = itemToDelete.item as { id: string };
      if (itemToDelete.type === 'payroll') {
        await deleteRecord('payroll', { id: item.id });
        toast({ title: 'Success', description: 'Payroll record deleted successfully' });
        fetchPayrollData();
      } else if (itemToDelete.type === 'period') {
        await deleteRecord('payroll_periods', { id: item.id });
        toast({ title: 'Success', description: 'Payroll period deleted successfully' });
        fetchPayrollPeriods();
        if (selectedPeriod === item.id) setSelectedPeriod('');
      }
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to delete item', variant: 'destructive' });
    }
    setItemToDelete(null);
    setDeleteDialogOpen(false);
  };

  const filteredRecords = payrollRecords.filter(r =>
    r.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportReport = async () => {
    try {
      await exportPayrollCSV(filteredRecords, selectedPeriod, toast);
    } catch (error: unknown) {
      console.error('Error exporting report:', error);
      toast({ title: 'Error', description: 'Failed to export payroll report', variant: 'destructive' });
    }
  };

  const handleDownloadPaySlip = async (record: PayrollRecord) => {
    try {
      const fullRecord = await selectOne('payroll', { id: record.id }) as Record<string, unknown> | null;
      if (!fullRecord) { toast({ title: 'Error', description: 'Payroll record not found', variant: 'destructive' }); return; }
      const employee = await selectOne('employee_details', { id: record.employee_id }) as Record<string, unknown> | null;
      if (!employee) { toast({ title: 'Error', description: 'Employee details not found', variant: 'destructive' }); return; }
      const profile = await selectOne('profiles', { user_id: employee.user_id }) as Record<string, unknown> | null;
      const employeeName = ((profile?.full_name || `${employee.first_name} ${employee.last_name}`.trim())) as string;
      const period = await selectOne('payroll_periods', { id: fullRecord.payroll_period_id as string }) as Record<string, unknown> | null;

      const html = generatePaySlipHTML({ employeeName, employee, period, record });
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `payslip-${employeeName.replace(/\s+/g, '-')}-${(period as { name?: string })?.name?.replace(/\s+/g, '-') || 'period'}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Success', description: 'Pay slip downloaded successfully' });
    } catch (error: unknown) {
      console.error('Error generating pay slip:', error);
      toast({ title: 'Error', description: 'Failed to generate pay slip', variant: 'destructive' });
    }
  };

  const bulk = useBulkPayrollActions({ filteredRecords, fetchPayrollData, userId: user?.id, toast });

  return {
    loading, searchTerm, setSearchTerm, selectedPeriod, setSelectedPeriod,
    payrollSummary, payrollPeriods, filteredRecords, urlDepartmentName,
    payrollFormOpen, setPayrollFormOpen, selectedPayroll,
    periodFormOpen, setPeriodFormOpen, selectedPeriodObj,
    deleteDialogOpen, setDeleteDialogOpen, itemToDelete, setItemToDelete,
    handleNewPayroll, handleEditPayroll, handleDeletePayroll,
    handleNewPeriod, handleEditPeriod, handleDeletePeriod,
    handlePayrollSaved, handlePeriodSaved, handleDeleted,
    handleExportReport, handleDownloadPaySlip,
    ...bulk,
  };
}

export type UsePayrollReturn = ReturnType<typeof usePayroll>;
