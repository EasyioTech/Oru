import { pgClient } from '@/integrations/postgresql/client';

export const generateFinancialReport = async (
  templateId: string,
  selectedMonth: string,
  agencyId?: string
): Promise<Record<string, unknown>> => {
  const [month, year] = selectedMonth.split('-').map(Number);

  switch (templateId) {
    case 'balance-sheet': {
      const balanceSheetQuery = `
        SELECT 
          coa.account_type,
          coa.account_code,
          coa.account_name,
          COALESCE(SUM(CASE WHEN coa.account_type IN ('asset', 'expense') THEN jel.debit_amount - jel.credit_amount ELSE 0 END), 0) as debit_balance,
          COALESCE(SUM(CASE WHEN coa.account_type IN ('liability', 'equity', 'revenue') THEN jel.credit_amount - jel.debit_amount ELSE 0 END), 0) as credit_balance
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
          AND je.status = 'posted'
          ${agencyId ? 'AND je.agency_id = $1' : ''}
        GROUP BY coa.id, coa.account_type, coa.account_code, coa.account_name
        ORDER BY coa.account_type, coa.account_code
      `;
      const result = await pgClient.query(balanceSheetQuery, agencyId ? [agencyId] : []);
      return { accounts: result.rows };
    }
    case 'profit-loss': {
      const plQuery = `
        SELECT 
          coa.account_type,
          coa.account_name,
          COALESCE(SUM(CASE WHEN coa.account_type = 'revenue' THEN jel.credit_amount - jel.debit_amount ELSE 0 END), 0) as revenue,
          COALESCE(SUM(CASE WHEN coa.account_type = 'expense' THEN jel.debit_amount - jel.credit_amount ELSE 0 END), 0) as expense
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
        LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
          AND je.status = 'posted'
          ${agencyId ? 'AND je.agency_id = $3' : ''}
          AND EXTRACT(MONTH FROM je.entry_date) = $1
          AND EXTRACT(YEAR FROM je.entry_date) = $2
        WHERE coa.account_type IN ('revenue', 'expense')
        GROUP BY coa.id, coa.account_type, coa.account_name
      `;
      const plParams = agencyId ? [month, year, agencyId] : [month, year];
      const plResult = await pgClient.query(plQuery, plParams);
      return { accounts: plResult.rows };
    }
    case 'job-profitability': {
      const jobQuery = `
        SELECT 
          j.job_number,
          j.title,
          j.budget,
          j.actual_cost,
          j.profit_margin,
          j.status,
          c.name as client_name
        FROM jobs j
        LEFT JOIN clients c ON j.client_id = c.id
        WHERE 1=1
          ${agencyId ? 'AND j.agency_id = $1' : ''}
        ORDER BY j.created_at DESC
      `;
      const jobResult = await pgClient.query(jobQuery, agencyId ? [agencyId] : []);
      return { jobs: jobResult.rows };
    }
    default:
      return {};
  }
};

export const generateAttendanceReport = async (
  selectedMonth: string,
  agencyId?: string
): Promise<Record<string, unknown>> => {
  const [month, year] = selectedMonth.split('-').map(Number);
  const query = `
    SELECT 
      p.full_name,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
      COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
      COUNT(*) as total_days,
      ROUND(COUNT(CASE WHEN a.status = 'present' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as attendance_rate
    FROM attendance a
    JOIN profiles p ON a.employee_id = p.user_id
    WHERE EXTRACT(MONTH FROM a.date) = $1
      AND EXTRACT(YEAR FROM a.date) = $2
      ${agencyId ? 'AND a.agency_id = $3' : ''}
    GROUP BY p.id, p.full_name
    ORDER BY attendance_rate DESC
  `;
  const result = await pgClient.query(query, agencyId ? [month, year, agencyId] : [month, year]);
  return { attendance: result.rows };
};

export const generatePayrollReport = async (
  selectedMonth: string,
  agencyId?: string
): Promise<Record<string, unknown>> => {
  const [month, year] = selectedMonth.split('-').map(Number);
  const query = `
    SELECT 
      p.full_name,
      pp.name as period_name,
      py.base_salary,
      py.overtime_pay,
      py.bonuses,
      py.deductions,
      py.gross_pay,
      py.tax_deductions,
      py.net_pay,
      py.hours_worked
    FROM payroll py
    JOIN profiles p ON py.employee_id = p.user_id
    JOIN payroll_periods pp ON py.payroll_period_id = pp.id
    WHERE EXTRACT(MONTH FROM pp.pay_date) = $1
      AND EXTRACT(YEAR FROM pp.pay_date) = $2
      ${agencyId ? 'AND py.agency_id = $3' : ''}
    ORDER BY p.full_name
  `;
  const result = await pgClient.query(query, agencyId ? [month, year, agencyId] : [month, year]);
  return { payroll: result.rows };
};

export const generateLeaveReport = async (agencyId?: string): Promise<Record<string, unknown>> => {
  const query = `
    SELECT 
      p.full_name,
      lt.name as leave_type,
      lr.start_date,
      lr.end_date,
      lr.total_days,
      lr.status,
      lr.reason
    FROM leave_requests lr
    JOIN profiles p ON lr.employee_id = p.user_id
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.created_at >= CURRENT_DATE - INTERVAL '3 months'
      ${agencyId ? 'AND lr.agency_id = $1' : ''}
    ORDER BY lr.created_at DESC
  `;
  const result = await pgClient.query(query, agencyId ? [agencyId] : []);
  return { leaves: result.rows };
};

export const generateEmployeeReport = async (agencyId?: string): Promise<Record<string, unknown>> => {
  const query = `
    SELECT 
      p.full_name,
      p.position,
      d.name as department,
      ed.hire_date,
      ed.is_active,
      COUNT(DISTINCT t.id) as tasks_assigned,
      COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed
    FROM profiles p
    JOIN employee_details ed ON p.user_id = ed.user_id
    LEFT JOIN departments d ON ed.department_id = d.id
    LEFT JOIN task_assignments ta ON p.user_id = ta.user_id
    LEFT JOIN tasks t ON ta.task_id = t.id
    WHERE 1=1
      ${agencyId ? 'AND ed.agency_id = $1' : ''}
    GROUP BY p.id, p.full_name, p.position, d.name, ed.hire_date, ed.is_active
    ORDER BY p.full_name
  `;
  const result = await pgClient.query(query, agencyId ? [agencyId] : []);
  return { employees: result.rows };
};

export const generateProjectReport = async (agencyId?: string): Promise<Record<string, unknown>> => {
  const query = `
    SELECT 
      p.name as project_name,
      p.status,
      p.budget,
      p.start_date,
      p.end_date,
      c.name as client_name,
      COUNT(DISTINCT t.id) as total_tasks,
      COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
      COALESCE(SUM(tt.hours_logged), 0) as total_hours
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN tasks t ON p.id = t.project_id
    LEFT JOIN task_time_tracking tt ON t.id = tt.task_id
    WHERE 1=1
      ${agencyId ? 'AND p.agency_id = $1' : ''}
    GROUP BY p.id, p.name, p.status, p.budget, p.start_date, p.end_date, c.name
    ORDER BY p.created_at DESC
  `;
  const result = await pgClient.query(query, agencyId ? [agencyId] : []);
  return { projects: result.rows };
};
