import { BaseApiService, ApiResponse, ApiOptions } from '../core';
import { pgClient } from '@/integrations/postgresql/client';
import { MonthlyTrend, DepartmentReport, ProjectReport } from './types';

export class AnalyticsDimensionsService extends BaseApiService {
  static async getMonthlyTrends(
    year: string,
    agencyId?: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<MonthlyTrend[]>> {
    return this.execute(async () => {
      const yearNum = parseInt(year);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const trendsQuery = `
        SELECT
          EXTRACT(MONTH FROM issue_date)::int as month,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
        FROM invoices
        WHERE EXTRACT(YEAR FROM issue_date) = $1
          ${agencyId ? 'AND agency_id = $2' : ''}
        GROUP BY EXTRACT(MONTH FROM issue_date)
        ORDER BY month
      `;

      const expensesQuery = `
        SELECT
          EXTRACT(MONTH FROM je.entry_date)::int as month,
          COALESCE(SUM(jel.debit_amount), 0) as expenses
        FROM journal_entry_lines jel
        JOIN journal_entries je ON jel.journal_entry_id = je.id
        JOIN chart_of_accounts coa ON jel.account_id = coa.id
        WHERE EXTRACT(YEAR FROM je.entry_date) = $1
          AND coa.account_type = 'expense'
        ${agencyId ? 'AND je.agency_id = $2' : ''}
        GROUP BY EXTRACT(MONTH FROM je.entry_date)
        ORDER BY month
      `;

      const params = agencyId ? [yearNum, agencyId] : [yearNum];

      const [revenueData, expensesData] = await Promise.all([
        pgClient.query(trendsQuery, params),
        pgClient.query(expensesQuery, params),
      ]);

      const revenueMap = new Map(revenueData.rows.map((r: Record<string, unknown>) => [r.month, parseFloat(r.revenue as string || '0')]));
      const expensesMap = new Map(expensesData.rows.map((r: Record<string, unknown>) => [r.month, parseFloat(r.expenses as string || '0')]));

      const trends: MonthlyTrend[] = [];
      for (let month = 1; month <= 12; month++) {
        const revenue = revenueMap.get(month) || 0;
        const expenses = expensesMap.get(month) || 0;
        trends.push({ month: monthNames[month - 1], revenue, expenses, profit: revenue - expenses });
      }

      return trends;
    }, options);
  }

  static async getDepartmentReports(
    agencyId?: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<DepartmentReport[]>> {
    return this.execute(async () => {
      const query = `
        SELECT
          d.name,
          COUNT(DISTINCT ta.user_id) as employees,
          COALESCE(SUM(esd.salary), 0) as budget,
          COALESCE(
            ROUND(
              (COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END)::numeric /
               NULLIF(COUNT(DISTINCT a.id), 0)) * 100,
              2
            ),
            0
          ) as utilization
        FROM departments d
        LEFT JOIN team_assignments ta ON d.id = ta.department_id
        LEFT JOIN employee_details ed ON ta.user_id = ed.user_id
        LEFT JOIN employee_salary_details esd ON ed.id = esd.employee_id
        LEFT JOIN attendance a ON ed.user_id = a.employee_id
          AND a.date >= CURRENT_DATE - INTERVAL '30 days'
        ${agencyId ? 'WHERE d.agency_id = $1' : ''}
        GROUP BY d.id, d.name
        ORDER BY d.name
      `;

      const params = agencyId ? [agencyId] : [];
      const result = await pgClient.query(query, params);

      return result.rows.map((row: Record<string, unknown>) => ({
        name: row.name,
        employees: parseInt(row.employees as string || '0'),
        budget: parseFloat(row.budget as string || '0'),
        utilization: parseFloat(row.utilization as string || '0'),
      }));
    }, options);
  }

  static async getProjectReports(
    agencyId?: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<ProjectReport[]>> {
    return this.execute(async () => {
      const query = `
        SELECT
          p.name,
          p.status,
          COALESCE(p.budget, 0) as budget,
          COALESCE(
            (SELECT SUM(tt.hours_logged * 1000)
             FROM task_time_tracking tt
             JOIN tasks t ON tt.task_id = t.id
             WHERE t.project_id = p.id),
            0
          ) as actual,
          CASE
            WHEN COALESCE(p.budget, 0) > 0 THEN
              ROUND(
                ((COALESCE(p.budget, 0) -
                  COALESCE(
                    (SELECT SUM(tt.hours_logged * 1000)
                     FROM task_time_tracking tt
                     JOIN tasks t ON tt.task_id = t.id
                     WHERE t.project_id = p.id),
                    0
                  )) / COALESCE(p.budget, 1)) * 100,
                2
              )
            ELSE 100
          END as margin
        FROM projects p
        ${agencyId ? 'WHERE p.agency_id = $1' : ''}
        ORDER BY p.created_at DESC
        LIMIT 50
      `;

      const params = agencyId ? [agencyId] : [];
      const result = await pgClient.query(query, params);

      return result.rows.map((row: Record<string, unknown>) => ({
        name: row.name,
        status: row.status || 'planning',
        budget: parseFloat(row.budget as string || '0'),
        actual: parseFloat(row.actual as string || '0'),
        margin: parseFloat(row.margin as string || '0'),
      }));
    }, options);
  }
}
