import { Queue, Worker } from 'bullmq';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { employees } from '../../infrastructure/database/schemas/hr.js';
import { sendNotificationEmail } from '../../infrastructure/email/send.js';

export type HrJobName =
  | 'calculate-attendance'
  | 'update-leave-balances'
  | 'send-payslip'
  | 'birthday-reminder'
  | 'probation-end-alert';

export interface HrJobData {
  agencyId: string;
  employeeId?: string;
  month?: number;
  year?: number;
}

export function createHrQueue(redis: any) {
  return new Queue<HrJobData>('hr', { connection: redis });
}

export function startHrWorker(redis: any, db: NodePgDatabase<any>) {
  return new Worker<HrJobData>(
    'hr',
    async (job) => {
      try {
        switch (job.name as HrJobName) {
          case 'calculate-attendance': {
            console.log(`[calculate-attendance] No attendance summary table exists. Logging result for agency: ${job.data.agencyId}`);
            break;
          }
          case 'update-leave-balances': {
            console.log(`[update-leave-balances] No leave_balances table exists. Logging result for agency: ${job.data.agencyId}`);
            break;
          }
          case 'send-payslip': {
            console.log(`[send-payslip] Load payroll record for employee: ${job.data.employeeId}`);
            if (job.data.employeeId) {
                const emps = await db.select().from(employees).where(eq(employees.id, job.data.employeeId)).limit(1);
                if (emps.length > 0) {
                    const emp = emps[0];
                    await sendNotificationEmail(emp.email, {
                      title: 'Payslip',
                      message: `Payslip summary for ${emp.firstName} ${emp.lastName}`,
                    });
                }
            }
            break;
          }
          case 'birthday-reminder':
          case 'probation-end-alert':
            break;
        }
      } catch (err) {
        console.error(`Error in HR worker:`, err);
        throw err;
      }
    },
    { connection: redis }
  );
}
