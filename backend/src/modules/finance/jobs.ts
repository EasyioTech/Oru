import { Queue, Worker } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const FINANCE_QUEUE = 'finance';

export const financeJobs = {
    GENERATE_PAYROLL: 'generate-payroll',
    GENERATE_INVOICE: 'generate-invoice',
};

export interface FinanceJobData {
  agencyId: string;
  month?: number;
  year?: number;
  employeeId?: string;
}

export function createFinanceQueue(redis: any) {
  return new Queue<FinanceJobData>(FINANCE_QUEUE, { connection: redis });
}

export function startFinanceWorker(redis: any, db: NodePgDatabase<any>) {
  return new Worker<FinanceJobData>(
    FINANCE_QUEUE,
    async (job) => {
      try {
        switch (job.name) {
          case financeJobs.GENERATE_PAYROLL: {
            console.log(`[generate-payroll] Compute payroll for all employees in agency: ${job.data.agencyId} for ${job.data.month}/${job.data.year}. Payroll table missing, skipping insert.`);
            break;
          }
          case financeJobs.GENERATE_INVOICE: {
            console.log(`[generate-invoice] Stub, log only`);
            break;
          }
        }
      } catch (err) {
        console.error(`Error in Finance worker:`, err);
        throw err;
      }
    },
    { connection: redis }
  );
}
