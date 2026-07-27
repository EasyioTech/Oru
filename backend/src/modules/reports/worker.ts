import { Worker } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { reportJobs, createReportsQueue, REPORTS_QUEUE } from './jobs.js';

export function startReportsWorker(redis: any, db: NodePgDatabase<any>) {
  return new Worker(
    REPORTS_QUEUE,
    async (job) => {
      try {
        switch (job.name) {
          case reportJobs.GENERATE_REPORT: {
            // Call ReportsService.generateReport(job.data)
            // Store result to MinIO via uploadFileToS3
            console.log(`[generate-report] Generating report for job ${job.id}`);
            break;
          }
          case reportJobs.EXPORT_EXCEL: {
            console.log(`[export-excel] ExcelJS worker stub — implement when ExcelJS added`);
            break;
          }
          case reportJobs.SCHEDULED_REPORT: {
            console.log(`[scheduled-report] Enqueueing generate-report`);
            const queue = createReportsQueue(redis);
            await queue.add(reportJobs.GENERATE_REPORT, job.data);
            break;
          }
        }
      } catch (err) {
        console.error(`Error in Reports worker:`, err);
        throw err;
      }
    },
    { connection: redis }
  );
}
