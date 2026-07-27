import { Queue, Worker } from 'bullmq';


export type AgencyJobName =
  | 'provision-agency-db'
  | 'send-welcome-email'
  | 'suspend-agency'
  | 'delete-agency-data';

export interface AgencyJobData {
  agencyId: string;
  adminEmail?: string;
  reason?: string;
}

export function createAgenciesQueue(redis: any) {
  return new Queue<AgencyJobData>('agencies', { connection: redis });
}

export function createAgenciesWorker(
  redis: any,
  handlers: {
    onProvisionAgencyDb?: (data: AgencyJobData) => Promise<void>;
    onSendWelcomeEmail?: (data: AgencyJobData) => Promise<void>;
    onSuspendAgency?: (data: AgencyJobData) => Promise<void>;
    onDeleteAgencyData?: (data: AgencyJobData) => Promise<void>;
  }
) {
  return new Worker<AgencyJobData>(
    'agencies',
    async (job) => {
      switch (job.name as AgencyJobName) {
        case 'provision-agency-db':
          await handlers.onProvisionAgencyDb?.(job.data);
          break;
        case 'send-welcome-email':
          await handlers.onSendWelcomeEmail?.(job.data);
          break;
        case 'suspend-agency':
          await handlers.onSuspendAgency?.(job.data);
          break;
        case 'delete-agency-data':
          await handlers.onDeleteAgencyData?.(job.data);
          break;
      }
    },
    { connection: redis }
  );
}
