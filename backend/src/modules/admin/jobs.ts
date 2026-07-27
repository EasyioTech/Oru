import { Queue, Worker } from 'bullmq';


export type AdminJobName =
  | 'provision-agency'
  | 'deprovision-agency'
  | 'purge-audit-logs'
  | 'platform-health-check';

export interface AdminJobData {
  agencyId?: string;
  olderThanDays?: number;
}

export function createAdminQueue(redis: any) {
  return new Queue<AdminJobData>('admin', { connection: redis });
}

export function createAdminWorker(
  redis: any,
  handlers: {
    onProvisionAgency?: (data: AdminJobData) => Promise<void>;
    onDeprovisionAgency?: (data: AdminJobData) => Promise<void>;
    onPurgeAuditLogs?: (data: AdminJobData) => Promise<void>;
  }
) {
  return new Worker<AdminJobData>(
    'admin',
    async (job) => {
      switch (job.name as AdminJobName) {
        case 'provision-agency':
          await handlers.onProvisionAgency?.(job.data);
          break;
        case 'deprovision-agency':
          await handlers.onDeprovisionAgency?.(job.data);
          break;
        case 'purge-audit-logs':
          await handlers.onPurgeAuditLogs?.(job.data);
          break;
        case 'platform-health-check':
          break;
      }
    },
    { connection: redis }
  );
}
