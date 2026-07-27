export interface PayrollRecord {
  id: string;
  employee: string;
  position: string;
  baseSalary: number;
  overtime: number;
  deductions: number;
  netPay: number;
  status: string;
  payPeriod: string;
  employee_id?: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  pendingPayroll: number;
}
