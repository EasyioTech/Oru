import { BaseApiService, ApiResponse } from '../core';
import { getApiBaseUrl } from '@/config/api';
import { getStorageItem } from './_client';
import { ScheduledReport, ReportExport, AnalyticsMetrics } from './types';

const API_BASE = getApiBaseUrl();

export class ScheduledReportService extends BaseApiService {
  static async getScheduledReports(filters?: {
    report_type?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<ApiResponse<ScheduledReport[]>> {
    return this.execute(async () => {
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const queryParams = new URLSearchParams();
      if (filters?.report_type) queryParams.append('report_type', filters.report_type);
      if (filters?.is_active !== undefined) queryParams.append('is_active', String(filters.is_active));
      if (filters?.search) queryParams.append('search', filters.search);

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/scheduled?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Agency-Database': agencyDatabase },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch scheduled reports' }));
        throw new Error(error.error || 'Failed to fetch scheduled reports');
      }

      const result = await response.json();
      return result.data || [];
    }, {});
  }

  static async getScheduledReportById(scheduleId: string): Promise<ApiResponse<ScheduledReport>> {
    return this.execute(async () => {
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/scheduled/${scheduleId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Agency-Database': agencyDatabase },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch scheduled report' }));
        throw new Error(error.error || 'Failed to fetch scheduled report');
      }

      const result = await response.json();
      return result.data;
    }, {});
  }

  static async createScheduledReport(scheduleData: Partial<ScheduledReport>): Promise<ApiResponse<ScheduledReport>> {
    return this.execute(async () => {
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/scheduled`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Agency-Database': agencyDatabase,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create scheduled report' }));
        throw new Error(error.error || 'Failed to create scheduled report');
      }

      const result = await response.json();
      return result.data;
    });
  }

  static async updateScheduledReport(scheduleId: string, scheduleData: Partial<ScheduledReport>): Promise<ApiResponse<ScheduledReport>> {
    return this.execute(async () => {
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/scheduled/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Agency-Database': agencyDatabase,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to update scheduled report' }));
        throw new Error(error.error || 'Failed to update scheduled report');
      }

      const result = await response.json();
      return result.data;
    }, {});
  }

  static async deleteScheduledReport(scheduleId: string): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/scheduled/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'X-Agency-Database': agencyDatabase },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete scheduled report' }));
        throw new Error(error.error || 'Failed to delete scheduled report');
      }
    });
  }

  static async getReportExports(filters?: {
    status?: string;
    format?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }): Promise<ReportExport[]> {
    return this.execute(async () => {
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.format) queryParams.append('format', filters.format);
      if (filters?.date_from) queryParams.append('date_from', filters.date_from);
      if (filters?.date_to) queryParams.append('date_to', filters.date_to);
      if (filters?.search) queryParams.append('search', filters.search);

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/exports?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Agency-Database': agencyDatabase },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch report exports' }));
        throw new Error(error.error || 'Failed to fetch report exports');
      }

      const result = await response.json();
      return result.data || [];
    }, {});
  }

  static async deleteReportExport(exportId: string): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/exports/${exportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'X-Agency-Database': agencyDatabase },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete report export' }));
        throw new Error(error.error || 'Failed to delete report export');
      }
      return undefined;
    }, {});
  }

  static async getAnalyticsDashboard(filters?: {
    date_from?: string;
    date_to?: string;
    period?: string;
  }): Promise<ApiResponse<AnalyticsMetrics>> {
    return this.execute(async () => {
      const token = getStorageItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const queryParams = new URLSearchParams();
      if (filters?.date_from) queryParams.append('date_from', filters.date_from);
      if (filters?.date_to) queryParams.append('date_to', filters.date_to);
      if (filters?.period) queryParams.append('period', filters.period);

      const agencyDatabase = getStorageItem('agency_database') || '';

      const response = await fetch(`${API_BASE}/api/reports/analytics?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Agency-Database': agencyDatabase },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch analytics data' }));
        throw new Error(error.error || 'Failed to fetch analytics data');
      }

      const result = await response.json();
      return result.data;
    }, {});
  }
}
