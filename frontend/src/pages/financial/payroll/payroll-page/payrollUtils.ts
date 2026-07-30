import type { PayrollRecord } from './types';

export function getStatusColor(status: string): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'paid':
    case 'approved':
      return 'default';
    default:
      return 'secondary';
  }
}

interface PaySlipData {
  employeeName: string;
  employee: Record<string, any>;
  period: Record<string, any> | null;
  record: PayrollRecord;
}

export function generatePaySlipHTML({ employeeName, employee, period, record }: PaySlipData): string {
  const periodName = (period as { name?: string })?.name || 'Payroll Period';
  const periodRange = period
    ? `${new Date((period as { start_date: string }).start_date).toLocaleDateString()} - ${new Date((period as { end_date: string }).end_date).toLocaleDateString()}`
    : 'N/A';
  const employeeId = (employee as { employee_id?: string }).employee_id || record.employee_id?.substring(0, 8) || '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pay Slip - ${employeeName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .details { margin-bottom: 20px; }
    .details table { width: 100%; border-collapse: collapse; }
    .details td { padding: 8px; border-bottom: 1px solid #ddd; }
    .details td:first-child { font-weight: bold; width: 40%; }
    .summary { margin-top: 30px; }
    .summary table { width: 100%; border-collapse: collapse; }
    .summary td { padding: 10px; border: 1px solid #ddd; }
    .summary td:first-child { font-weight: bold; }
    .total { font-size: 18px; font-weight: bold; color: #059669; }
  </style>
</head>
<body>
  <div class="header"><h1>PAY SLIP</h1><p>${periodName}</p></div>
  <div class="details">
    <table>
      <tr><td>Employee Name:</td><td>${employeeName}</td></tr>
      <tr><td>Employee ID:</td><td>${employeeId}</td></tr>
      <tr><td>Position:</td><td>${record.position}</td></tr>
      <tr><td>Period:</td><td>${periodRange}</td></tr>
      <tr><td>Status:</td><td>${record.status.toUpperCase()}</td></tr>
    </table>
  </div>
  <div class="summary">
    <h2>Earnings &amp; Deductions</h2>
    <table>
      <tr><td>Base Salary</td><td style="text-align:right;">&#8377;${record.baseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
      <tr><td>Overtime Pay</td><td style="text-align:right;">&#8377;${record.overtime.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
      <tr><td>Deductions</td><td style="text-align:right;color:#dc2626;">-&#8377;${record.deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
      <tr class="total"><td>Net Pay</td><td style="text-align:right;">&#8377;${record.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
    </table>
  </div>
  <div style="margin-top:40px;text-align:center;color:#666;font-size:12px;">
    <p>This is a computer-generated pay slip.</p>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;
}
