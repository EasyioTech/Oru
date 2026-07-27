import { BaseApiService, ApiResponse, ApiOptions } from '../core';
import { pgClient } from '@/integrations/postgresql/client';
import { MonthlyReportData, YearlyReportData } from './types';

export class AnalyticsSummaryService extends BaseApiService {
  static async getMonthlyReport(
    month: string,
    year: string,
    agencyId?: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<MonthlyReportData>> {
    return this.execute(async () => {
      const [monthNum, yearNum] = month.split('-').map(Number);

      const revenueQuery = `
        SELECT COALESCE(SUM(total_amount), 0) as revenue
        FROM invoices
        WHERE EXTRACT(MONTH FROM issue_date) = $1
          AND EXTRACT(YEAR FROM issue_date) = $2
          AND status = 'paid'
          ${agencyId ? 'AND agency_id = $3' : ''}
      `;
      const expensesQuery = `
        SELECT COALESCE(SUM(jel.debit_amount), 0) as expenses
        FROM journal_entry_lines jel
        JOIN journal_entries je ON jel.journal_entry_id = je.id
        JOIN chart_of_accounts coa ON jel.account_id = coa.id
        WHERE EXTRACT(MONTH FROM je.entry_date) = $1
          AND EXTRACT(YEAR FROM je.entry_date) = $2
          AND coa.account_type = 'expense'
        ${agencyId ? 'AND je.agency_id = $3' : ''}
      `;
      const employeesQuery = `
        SELECT COUNT(DISTINCT ed.id) as count
        FROM employee_details ed
        JOIN profiles p ON ed.user_id = p.id
        WHERE ed.is_active = true
        ${agencyId ? 'AND ed.agency_id = $1' : ''}
      `;
      const activeProjectsQuery = `
        SELECT COUNT(*) as count
        FROM projects
        WHERE status IN ('in-progress', 'planning')
          AND EXTRACT(MONTH FROM start_date) <= $1
          AND EXTRACT(YEAR FROM start_date) = $2
          ${agencyId ? 'AND agency_id = $3' : ''}
      `;
      const completedProjectsQuery = `
        SELECT COUNT(*) as count
        FROM projects
        WHERE status = 'completed'
          AND EXTRACT(MONTH FROM end_date) = $1
          AND EXTRACT(YEAR FROM end_date) = $2
          ${agencyId ? 'AND agency_id = $3' : ''}
      `;
      const newClientsQuery = `
        SELECT COUNT(*) as count
        FROM clients
        WHERE EXTRACT(MONTH FROM created_at) = $1
          AND EXTRACT(YEAR FROM created_at) = $2
          ${agencyId ? 'AND agency_id = $3' : ''}
      `;
      const invoicesSentQuery = `
        SELECT COUNT(*) as count
        FROM invoices
        WHERE EXTRACT(MONTH FROM issue_date) = $1
          AND EXTRACT(YEAR FROM issue_date) = $2
          ${agencyId ? 'AND agency_id = $3' : ''}
      `;
      const paymentsReceivedQuery = `
        SELECT COUNT(*) as count
        FROM invoices
        WHERE EXTRACT(MONTH FROM issue_date) = $1
          AND EXTRACT(YEAR FROM issue_date) = $2
          AND status = 'paid'
          ${agencyId ? 'AND agency_id = $3' : ''}
      `;
      const attendanceQuery = `
        SELECT
          COALESCE(
            ROUND(
              (COUNT(CASE WHEN status = 'present' THEN 1 END)::numeric /
               NULLIF(COUNT(*), 0)) * 100,
              2
            ),
            0
          ) as rate
        FROM attendance
        WHERE EXTRACT(MONTH FROM date) = $1
          AND EXTRACT(YEAR FROM date) = $2
          ${agencyId ? 'AND agency_id = $3' : ''}
      `;

      const revenueParams = agencyId ? [monthNum, yearNum, agencyId] : [monthNum, yearNum];
      const expensesParams = agencyId ? [monthNum, yearNum, agencyId] : [monthNum, yearNum];
      const employeesParams = agencyId ? [agencyId] : [];
      const activeProjectsParams = agencyId ? [monthNum, yearNum, agencyId] : [monthNum, yearNum];
      const completedProjectsParams = agencyId ? [monthNum, yearNum, agencyId] : [monthNum, yearNum];
      const newClientsParams = agencyId ? [monthNum, yearNum, agencyId] : [monthNum, yearNum];
      const invoicesSentParams = agencyId ? [monthNum, yearNum, agencyId] : [monthNum, yearNum];
      const paymentsReceivedParams = agencyId ? [monthNum, yearNum, agencyId] : [monthNum, yearNum];
      const attendanceParams = agencyId ? [monthNum, yearNum, agencyId] : [monthNum, yearNum];

      const [revenue, expenses, employees, activeProjects, completedProjects,
             newClients, invoicesSent, paymentsReceived, attendance] = await Promise.all([
        pgClient.query(revenueQuery, revenueParams),
        pgClient.query(expensesQuery, expensesParams),
        pgClient.query(employeesQuery, employeesParams),
        pgClient.query(activeProjectsQuery, activeProjectsParams),
        pgClient.query(completedProjectsQuery, completedProjectsParams),
        pgClient.query(newClientsQuery, newClientsParams),
        pgClient.query(invoicesSentQuery, invoicesSentParams),
        pgClient.query(paymentsReceivedQuery, paymentsReceivedParams),
        pgClient.query(attendanceQuery, attendanceParams),
      ]);

      return {
        revenue: parseFloat(revenue.rows[0]?.revenue || '0'),
        expenses: parseFloat(expenses.rows[0]?.expenses || '0'),
        profit: parseFloat(revenue.rows[0]?.revenue || '0') - parseFloat(expenses.rows[0]?.expenses || '0'),
        employees: parseInt(employees.rows[0]?.count || '0'),
        activeProjects: parseInt(activeProjects.rows[0]?.count || '0'),
        completedProjects: parseInt(completedProjects.rows[0]?.count || '0'),
        newClients: parseInt(newClients.rows[0]?.count || '0'),
        invoicesSent: parseInt(invoicesSent.rows[0]?.count || '0'),
        paymentsReceived: parseInt(paymentsReceived.rows[0]?.count || '0'),
        attendanceRate: parseFloat(attendance.rows[0]?.rate || '0'),
      };
    }, options);
  }

  static async getYearlyReport(
    year: string,
    agencyId?: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<YearlyReportData>> {
    return this.execute(async () => {
      const yearNum = parseInt(year);

      const revenueQuery = `
        SELECT COALESCE(SUM(total_amount), 0) as revenue
        FROM invoices
        WHERE EXTRACT(YEAR FROM issue_date) = $1
          AND status = 'paid'
          ${agencyId ? 'AND agency_id = $2' : ''}
      `;
      const expensesQuery = `
        SELECT COALESCE(SUM(jel.debit_amount), 0) as expenses
        FROM journal_entry_lines jel
        JOIN journal_entries je ON jel.journal_entry_id = je.id
        JOIN chart_of_accounts coa ON jel.account_id = coa.id
        WHERE EXTRACT(YEAR FROM je.entry_date) = $1
          AND coa.account_type = 'expense'
        ${agencyId ? 'AND je.agency_id = $2' : ''}
      `;
      const employeesHiredQuery = `
        SELECT COUNT(*) as count
        FROM employee_details ed
        WHERE EXTRACT(YEAR FROM ed.created_at) = $1
          ${agencyId ? 'AND ed.agency_id = $2' : ''}
      `;
      const projectsCompletedQuery = `
        SELECT COUNT(*) as count
        FROM projects
        WHERE status = 'completed'
          AND EXTRACT(YEAR FROM end_date) = $1
          ${agencyId ? 'AND agency_id = $2' : ''}
      `;
      const newClientsQuery = `
        SELECT COUNT(*) as count
        FROM clients
        WHERE EXTRACT(YEAR FROM created_at) = $1
          ${agencyId ? 'AND agency_id = $2' : ''}
      `;
      const totalInvoicesQuery = `
        SELECT COUNT(*) as count
        FROM invoices
        WHERE EXTRACT(YEAR FROM issue_date) = $1
          ${agencyId ? 'AND agency_id = $2' : ''}
      `;
      const totalPaymentsQuery = `
        SELECT COUNT(*) as count
        FROM invoices
        WHERE EXTRACT(YEAR FROM issue_date) = $1
          AND status = 'paid'
          ${agencyId ? 'AND agency_id = $2' : ''}
      `;
      const avgAttendanceQuery = `
        SELECT
          COALESCE(
            ROUND(
              AVG(
                CASE WHEN status = 'present' THEN 100 ELSE 0 END
              ),
              2
            ),
            0
          ) as rate
        FROM attendance
        WHERE EXTRACT(YEAR FROM date) = $1
          ${agencyId ? 'AND agency_id = $2' : ''}
      `;

      const params = agencyId ? [yearNum, agencyId] : [yearNum];

      const [revenue, expenses, employeesHired, projectsCompleted, newClients,
             totalInvoices, totalPayments, avgAttendance] = await Promise.all([
        pgClient.query(revenueQuery, params),
        pgClient.query(expensesQuery, params),
        pgClient.query(employeesHiredQuery, params),
        pgClient.query(projectsCompletedQuery, params),
        pgClient.query(newClientsQuery, params),
        pgClient.query(totalInvoicesQuery, params),
        pgClient.query(totalPaymentsQuery, params),
        pgClient.query(avgAttendanceQuery, params),
      ]);

      return {
        revenue: parseFloat(revenue.rows[0]?.revenue || '0'),
        expenses: parseFloat(expenses.rows[0]?.expenses || '0'),
        profit: parseFloat(revenue.rows[0]?.revenue || '0') - parseFloat(expenses.rows[0]?.expenses || '0'),
        employeesHired: parseInt(employeesHired.rows[0]?.count || '0'),
        projectsCompleted: parseInt(projectsCompleted.rows[0]?.count || '0'),
        newClients: parseInt(newClients.rows[0]?.count || '0'),
        totalInvoices: parseInt(totalInvoices.rows[0]?.count || '0'),
        totalPayments: parseInt(totalPayments.rows[0]?.count || '0'),
        avgAttendance: parseFloat(avgAttendance.rows[0]?.rate || '0'),
      };
    }, options);
  }
}
