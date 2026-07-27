import { Queue } from 'bullmq';

export const REPORTS_QUEUE = 'reports';

export const reportJobs = {
    GENERATE_REPORT: 'generate-report',
    EXPORT_EXCEL: 'export-excel',
    SCHEDULED_REPORT: 'scheduled-report',
};

export function createReportsQueue(redis: any) {
  return new Queue(REPORTS_QUEUE, { connection: redis });
}
