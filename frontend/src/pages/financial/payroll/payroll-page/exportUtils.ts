import type { PayrollRecord } from './types';

type ToastFn = (opts: { title: string; description: string; variant?: 'default' | 'destructive' }) => void;

export async function exportPayrollCSV(records: PayrollRecord[], selectedPeriod: string, toast: ToastFn) {
  if (records.length === 0) {
    toast({ title: 'No Data', description: 'No payroll records to export', variant: 'destructive' });
    return;
  }

  const headers = ['Employee', 'Position', 'Base Salary', 'Overtime', 'Deductions', 'Net Pay', 'Status', 'Period'];
  const rows = records.map(r => [
    r.employee, r.position,
    r.baseSalary.toFixed(2), r.overtime.toFixed(2), r.deductions.toFixed(2), r.netPay.toFixed(2),
    r.status, r.payPeriod,
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `payroll-report-${selectedPeriod || 'all'}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast({ title: 'Success', description: 'Payroll report exported successfully' });
}
