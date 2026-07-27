export interface MonthlyReportData {
  revenue: number;
  expenses: number;
  profit: number;
  employees: number;
  activeProjects: number;
  completedProjects: number;
  newClients: number;
  invoicesSent: number;
  paymentsReceived: number;
  attendanceRate: number;
}

export interface YearlyReportData {
  revenue: number;
  expenses: number;
  profit: number;
  employeesHired: number;
  projectsCompleted: number;
  newClients: number;
  totalInvoices: number;
  totalPayments: number;
  avgAttendance: number;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DepartmentReport {
  name: string;
  employees: number;
  budget: number;
  utilization: number;
}

export interface ProjectReport {
  name: string;
  status: string;
  budget: number;
  actual: number;
  margin: number;
}

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  report_type: string;
  parameters: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  report_type: 'attendance' | 'payroll' | 'leave' | 'employee' | 'project' | 'financial' | 'gst' | 'custom';
  parameters: Record<string, unknown>;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  generated_by?: string;
  generated_at: string;
  expires_at?: string;
  is_public?: boolean;
  created_at: string;
}

export interface ScheduledReport {
  id: string;
  agency_id: string;
  report_template_id?: string;
  schedule_name: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  cron_expression?: string;
  day_of_week?: number;
  day_of_month?: number;
  time?: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  filters?: Record<string, unknown>;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_by?: string;
  created_by_email?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportExport {
  id: string;
  agency_id: string;
  report_id?: string;
  schedule_id?: string;
  name: string;
  report_type: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  file_path?: string;
  file_name?: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generated_by?: string;
  generated_by_email?: string;
  generated_at: string;
  expires_at?: string;
  download_count: number;
  parameters?: Record<string, unknown>;
}

export interface AnalyticsMetrics {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  revenue_growth: number;
  expense_growth: number;
  profit_margin: number;
  inventory_value: number;
  inventory_turnover: number;
  procurement_spend: number;
  asset_value: number;
  active_projects: number;
  employee_count: number;
  top_performers: Array<{
    name: string;
    metric: string;
    value: number;
    change: number;
  }>;
  trends: Array<{
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}
