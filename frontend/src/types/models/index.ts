export interface BaseModel {
  id: string;
  created_at?: string;
  updated_at?: string;
  agency_id?: string;
}

// -------------------------
// User & Auth
// -------------------------
export interface User extends Omit<BaseModel, 'agency_id'> {
  email: string;
  role?: string;
  is_active?: boolean;
  last_login?: string;
}

export interface Profile extends BaseModel {
  user_id: string;
  full_name: string;
  phone?: string;
  department?: string;
  position?: string;
  avatar_url?: string;
  personal_email?: string;
  is_active: boolean;
}

export interface UserRole extends Omit<BaseModel, 'created_at' | 'updated_at'> {
  user_id: string;
  role: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  task_reminders?: boolean;
  leave_notifications?: boolean;
  payroll_notifications?: boolean;
  project_updates?: boolean;
  system_alerts?: boolean;
  marketing_emails?: boolean;
}

// -------------------------
// Agency & System
// -------------------------
export interface Agency extends BaseModel {
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  subscription_status: string;
  subscription_plan_id?: string;
  trial_ends_at?: string;
  domain?: string;
  is_active?: boolean;
}

export interface AgencySettings {
  id: string;
  agency_id?: string; // Sometimes this is missing or global
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  timezone?: string;
  currency?: string;
  date_format?: string;
  time_format?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  default_language?: string;
  working_days?: string[];
  business_hours?: {
    start: string;
    end: string;
  };
  features?: Record<string, boolean>;
  smtp_settings?: Record<string, unknown>;
  payment_gateways?: Record<string, unknown>;
  tax_settings?: Record<string, unknown>;
  invoice_settings?: Record<string, unknown>;
  leave_settings?: Record<string, unknown>;
  payroll_settings?: Record<string, unknown>;
  attendance_settings?: Record<string, unknown>;
  performance_settings?: Record<string, unknown>;
  recruitment_settings?: Record<string, unknown>;
  project_settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface Department extends BaseModel {
  name: string;
  description?: string;
  manager_id?: string;
  parent_id?: string;
  is_active: boolean;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_name: string;
  is_included: boolean;
  limit_value?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  is_active: boolean;
  features?: PlanFeature[];
  created_at?: string;
  updated_at?: string;
}

// -------------------------
// HR & Employee
// -------------------------
export interface Employee extends BaseModel {
  user_id: string;
  employee_id?: string;
  department_id?: string;
  manager_id?: string;
  hire_date?: string;
  employment_type?: string;
  status: string;
  salary?: number;
  currency?: string;
  full_name?: string;
  email?: string;
  position?: string;
  phone?: string;
  avatar_url?: string;
}

export interface LeaveRequest extends BaseModel {
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  manager_id?: string;
  attachments?: string[];
  leave_type_name?: string;
  employee_name?: string;
}

export interface Attendance extends BaseModel {
  employee_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: string; // 'present', 'absent', 'late', 'half_day'
  notes?: string;
}

export interface PayrollPeriod extends BaseModel {
  name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'processing' | 'completed' | 'paid';
  payment_date?: string;
}

export interface Payroll extends BaseModel {
  employee_id: string;
  period_id: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid';
  payment_method?: string;
}

// -------------------------
// CRM & Clients
// -------------------------
export interface Client extends BaseModel {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  website?: string;
  status: string;
  assigned_to?: string;
  is_active: boolean;
}

export interface Lead extends BaseModel {
  title: string;
  contact_name: string;
  email?: string;
  phone?: string;
  company?: string;
  source_id?: string;
  status: string;
  value?: number;
  probability?: number;
  assigned_to?: string;
}

export interface CrmActivity extends BaseModel {
  entity_type: 'lead' | 'client' | 'project';
  entity_id: string;
  activity_type: string;
  subject: string;
  description?: string;
  date: string;
  user_id: string;
  is_completed: boolean;
}

// -------------------------
// Projects & Tasks
// -------------------------
export interface Project extends BaseModel {
  name: string;
  description?: string;
  client_id?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  manager_id?: string;
  team_members?: string[];
  progress?: number;
}

export interface Task extends BaseModel {
  project_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

// -------------------------
// Financial
// -------------------------
export interface Invoice extends BaseModel {
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  client_name?: string;
}

export interface InvoiceLineItem extends BaseModel {
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export interface Quotation extends BaseModel {
  client_id: string;
  quotation_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  notes?: string;
}

// -------------------------
// Reports
// -------------------------
export interface ReportExport extends BaseModel {
  name: string;
  report_type: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  file_path?: string;
  file_name?: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generated_by?: string;
  generated_at: string;
  expires_at?: string;
  download_count: number;
  parameters?: Record<string, unknown>;
}

export interface ScheduledReport extends BaseModel {
  name: string;
  description?: string;
  report_type: 'inventory' | 'procurement' | 'assets' | 'financial' | 'custom' | string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_config: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
}
