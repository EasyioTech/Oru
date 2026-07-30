import { BaseApiService, ApiResponse, ApiOptions } from '../core';
import { pgClient } from '@/integrations/postgresql/client';
import { getApiBaseUrl } from '@/config/api';
import { getStorageItem } from './_client';
import { Report } from './types';

export class ReportsCrudService extends BaseApiService {
  static async getReports(
    filters?: {
      report_type?: string;
      generated_by?: string;
      is_public?: boolean;
      agency_id?: string;
    },
    options: ApiOptions = {}
  ): Promise<ApiResponse<Report[]>> {
    return this.query<Report[]>('reports', {
      filters: filters || {},
      orderBy: { column: 'generated_at', ascending: false },
    }, options);
  }

  static async getReport(
    reportId: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<Report>> {
    return this.query<Report>('reports', {
      filters: { id: reportId },
      single: true,
    }, options);
  }

  static async createReport(
    data: {
      name: string;
      description?: string;
      report_type: 'attendance' | 'payroll' | 'leave' | 'employee' | 'project' | 'financial' | 'gst' | 'custom';
      parameters?: Record<string, any>;
      file_path?: string;
      file_name?: string;
      file_size?: number;
      generated_by?: string;
      expires_at?: string;
      is_public?: boolean;
      agency_id?: string;
    },
    options: ApiOptions = {}
  ): Promise<ApiResponse<Report>> {
    return this.execute<Report>(async () => {
      const parametersJson = JSON.stringify(data.parameters || {});

      const query = `
        INSERT INTO public.reports (
          name, description, report_type, parameters, file_path, file_name,
          file_size, generated_by, expires_at, is_public, agency_id
        )
        VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        data.name,
        data.description || null,
        data.report_type,
        parametersJson,
        data.file_path || null,
        data.file_name || null,
        data.file_size || null,
        data.generated_by || null,
        data.expires_at || null,
        data.is_public ?? false,
        data.agency_id || null,
      ];

      const result = await pgClient.query(query, values);
      return result.rows[0] as Report;
    }, options);
  }

  static async updateReport(
    reportId: string,
    data: Partial<{
      name: string;
      description: string;
      parameters: Record<string, any>;
      file_path: string;
      file_name: string;
      file_size: number;
      expires_at: string;
      is_public: boolean;
    }>,
    options: ApiOptions = {}
  ): Promise<ApiResponse<Report>> {
    return this.execute<Report>(async () => {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) { updateFields.push(`name = $${paramIndex++}`); values.push(data.name); }
      if (data.description !== undefined) { updateFields.push(`description = $${paramIndex++}`); values.push(data.description); }
      if (data.parameters !== undefined) { updateFields.push(`parameters = $${paramIndex++}::jsonb`); values.push(JSON.stringify(data.parameters)); }
      if (data.file_path !== undefined) { updateFields.push(`file_path = $${paramIndex++}`); values.push(data.file_path); }
      if (data.file_name !== undefined) { updateFields.push(`file_name = $${paramIndex++}`); values.push(data.file_name); }
      if (data.file_size !== undefined) { updateFields.push(`file_size = $${paramIndex++}`); values.push(data.file_size); }
      if (data.expires_at !== undefined) { updateFields.push(`expires_at = $${paramIndex++}`); values.push(data.expires_at); }
      if (data.is_public !== undefined) { updateFields.push(`is_public = $${paramIndex++}`); values.push(data.is_public); }

      if (updateFields.length === 0) {
        const getResult = await pgClient.query('SELECT * FROM reports WHERE id = $1', [reportId]);
        return getResult.rows[0] as Report;
      }

      values.push(reportId);
      const query = `
        UPDATE public.reports
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pgClient.query(query, values);
      return result.rows[0] as Report;
    }, options);
  }

  static async deleteReport(
    reportId: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<void>> {
    return this.delete<void>('reports', { id: reportId }, options);
  }

  static async getReportsByType(
    reportType: 'attendance' | 'payroll' | 'leave' | 'employee' | 'project' | 'financial' | 'gst' | 'custom',
    _agencyId?: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<Report[]>> {
    return this.getReports({ report_type: reportType }, options);
  }

  static async getDashboardData(
    filters?: { date_from?: string; date_to?: string },
    options: ApiOptions = {}
  ): Promise<ApiResponse<any>> {
    return this.execute(async () => {
      const API_BASE = getApiBaseUrl();
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      if (filters?.date_from && isNaN(Date.parse(filters.date_from))) {
        throw new Error('Invalid date_from format. Use YYYY-MM-DD');
      }
      if (filters?.date_to && isNaN(Date.parse(filters.date_to))) {
        throw new Error('Invalid date_to format. Use YYYY-MM-DD');
      }
      if (filters?.date_from && filters?.date_to && new Date(filters.date_from) > new Date(filters.date_to)) {
        throw new Error('date_from must be before or equal to date_to');
      }

      const queryParams = new URLSearchParams();
      if (filters?.date_from) queryParams.append('date_from', filters.date_from);
      if (filters?.date_to) queryParams.append('date_to', filters.date_to);

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/dashboard?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Agency-Database': agencyDatabase,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch dashboard data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to fetch dashboard data');
      return result.data;
    }, options);
  }

  static async generateCustomReport(
    module: 'inventory' | 'procurement' | 'assets' | 'financial',
    options: {
      filters?: Record<string, any>;
      columns?: string[];
      groupBy?: string[];
      orderBy?: string;
    } = {}
  ): Promise<any[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Authentication required');

    const API_BASE = getApiBaseUrl();

    const response = await fetch(`${API_BASE}/api/reports/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Agency-Database': localStorage.getItem('agency_database') || '',
      },
      body: JSON.stringify({ module, ...options }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to generate custom report' }));
      throw new Error(error.error || 'Failed to generate custom report');
    }

    const result = await response.json();
    return result.data || [];
  }
}
