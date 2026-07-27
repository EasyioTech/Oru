import { Queue, Worker } from 'bullmq';


export type CrmJobName =
  | 'send-lead-follow-up'
  | 'deal-inactivity-alert'
  | 'activity-reminder';

export interface CrmJobData {
  agencyId: string;
  leadId?: string;
  dealId?: string;
  activityId?: string;
  userId?: string;
}

export function createCrmQueue(redis: any) {
  return new Queue<CrmJobData>('crm', { connection: redis });
}

export function createCrmWorker(
  redis: any,
  handlers: {
    onLeadFollowUp?: (data: CrmJobData) => Promise<void>;
    onDealInactivityAlert?: (data: CrmJobData) => Promise<void>;
    onActivityReminder?: (data: CrmJobData) => Promise<void>;
  }
) {
  return new Worker<CrmJobData>(
    'crm',
    async (job) => {
      switch (job.name as CrmJobName) {
        case 'send-lead-follow-up':
          await handlers.onLeadFollowUp?.(job.data);
          break;
        case 'deal-inactivity-alert':
          await handlers.onDealInactivityAlert?.(job.data);
          break;
        case 'activity-reminder':
          await handlers.onActivityReminder?.(job.data);
          break;
      }
    },
    { connection: redis }
  );
}
