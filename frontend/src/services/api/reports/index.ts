export * from './types';
export * from './analytics-summary';
export * from './analytics-dimensions';
export * from './custom-reports';
export * from './reports-crud';
export * from './scheduled';

import { AnalyticsSummaryService } from './analytics-summary';
import { AnalyticsDimensionsService } from './analytics-dimensions';
import { CustomReportService } from './custom-reports';
import { ReportsCrudService } from './reports-crud';
import { ScheduledReportService } from './scheduled';

// Facade: preserves ReportService.method() call pattern used by all consumers
export class ReportService {
  static getMonthlyReport = AnalyticsSummaryService.getMonthlyReport.bind(AnalyticsSummaryService);
  static getYearlyReport = AnalyticsSummaryService.getYearlyReport.bind(AnalyticsSummaryService);

  static getMonthlyTrends = AnalyticsDimensionsService.getMonthlyTrends.bind(AnalyticsDimensionsService);
  static getDepartmentReports = AnalyticsDimensionsService.getDepartmentReports.bind(AnalyticsDimensionsService);
  static getProjectReports = AnalyticsDimensionsService.getProjectReports.bind(AnalyticsDimensionsService);

  static getCustomReports = CustomReportService.getCustomReports.bind(CustomReportService);
  static getCustomReport = CustomReportService.getCustomReport.bind(CustomReportService);
  static createCustomReport = CustomReportService.createCustomReport.bind(CustomReportService);
  static updateCustomReport = CustomReportService.updateCustomReport.bind(CustomReportService);
  static deleteCustomReport = CustomReportService.deleteCustomReport.bind(CustomReportService);

  static getReports = ReportsCrudService.getReports.bind(ReportsCrudService);
  static getReport = ReportsCrudService.getReport.bind(ReportsCrudService);
  static createReport = ReportsCrudService.createReport.bind(ReportsCrudService);
  static updateReport = ReportsCrudService.updateReport.bind(ReportsCrudService);
  static deleteReport = ReportsCrudService.deleteReport.bind(ReportsCrudService);
  static getReportsByType = ReportsCrudService.getReportsByType.bind(ReportsCrudService);
  static getDashboardData = ReportsCrudService.getDashboardData.bind(ReportsCrudService);
  static generateCustomReport = ReportsCrudService.generateCustomReport.bind(ReportsCrudService);

  static getScheduledReports = ScheduledReportService.getScheduledReports.bind(ScheduledReportService);
  static getScheduledReportById = ScheduledReportService.getScheduledReportById.bind(ScheduledReportService);
  static createScheduledReport = ScheduledReportService.createScheduledReport.bind(ScheduledReportService);
  static updateScheduledReport = ScheduledReportService.updateScheduledReport.bind(ScheduledReportService);
  static deleteScheduledReport = ScheduledReportService.deleteScheduledReport.bind(ScheduledReportService);
  static getReportExports = ScheduledReportService.getReportExports.bind(ScheduledReportService);
  static deleteReportExport = ScheduledReportService.deleteReportExport.bind(ScheduledReportService);
  static getAnalyticsDashboard = ScheduledReportService.getAnalyticsDashboard.bind(ScheduledReportService);
}
