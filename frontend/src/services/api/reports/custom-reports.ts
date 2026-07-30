import { BaseApiService, ApiResponse, ApiOptions } from '../core';
import { pgClient } from '@/integrations/postgresql/client';
import { logError } from '@/utils/consoleLogger';
import { CustomReport } from './types';

export class CustomReportService extends BaseApiService {
  static async getCustomReports(
    userId?: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<CustomReport[]>> {
    return this.query<CustomReport[]>('custom_reports', {
      filters: userId ? { created_by: userId } : {},
      orderBy: { column: 'created_at', ascending: false },
    }, options);
  }

  static async getCustomReport(
    reportId: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<CustomReport>> {
    return this.query<CustomReport>('custom_reports', {
      filters: { id: reportId },
      single: true,
    }, options);
  }

  static async createCustomReport(
    data: {
      name: string;
      description?: string;
      report_type: string;
      parameters: Record<string, any>;
      created_by: string;
      agency_id?: string;
    },
    options: ApiOptions = {}
  ): Promise<ApiResponse<CustomReport>> {
    return this.execute<CustomReport>(async () => {
      const parametersJson = JSON.stringify(data.parameters || {});

      const query = `
        INSERT INTO public.custom_reports (name, description, report_type, parameters, created_by, agency_id)
        VALUES ($1, $2, $3, $4::jsonb, $5, $6)
        RETURNING *
      `;

      const values = [
        data.name,
        data.description || null,
        data.report_type,
        parametersJson,
        data.created_by,
        data.agency_id || null,
      ];

      try {
        const result = await pgClient.query(query, values);
        return result.rows[0] as CustomReport;
      } catch (error) {
        logError('Error inserting custom report:', error);
        throw error;
      }
    }, options);
  }

  static async updateCustomReport(
    reportId: string,
    data: Partial<{
      name: string;
      description: string;
      parameters: Record<string, any>;
    }>,
    options: ApiOptions = {}
  ): Promise<ApiResponse<CustomReport>> {
    return this.update<CustomReport>('custom_reports', {
      ...data,
      updated_at: new Date().toISOString(),
    }, { id: reportId }, options);
  }

  static async deleteCustomReport(
    reportId: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<void>> {
    return this.delete<void>('custom_reports', { id: reportId }, options);
  }
}
