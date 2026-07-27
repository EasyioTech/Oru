import { Queue, Worker } from 'bullmq';


export type AuthJobName =
  | 'send-verification-email'
  | 'send-password-reset'
  | 'cleanup-expired-sessions'
  | 'revoke-stale-tokens';

export interface AuthJobData {
  userId?: string;
  email?: string;
  token?: string;
  agencyId?: string;
}

export function createAuthQueue(redis: any) {
  return new Queue<AuthJobData>('auth', { connection: redis });
}

export function createAuthWorker(
  redis: any,
  handlers: {
    onSendVerificationEmail?: (data: AuthJobData) => Promise<void>;
    onSendPasswordReset?: (data: AuthJobData) => Promise<void>;
    onCleanupExpiredSessions?: (data: AuthJobData) => Promise<void>;
  }
) {
  return new Worker<AuthJobData>(
    'auth',
    async (job) => {
      switch (job.name as AuthJobName) {
        case 'send-verification-email':
          await handlers.onSendVerificationEmail?.(job.data);
          break;
        case 'send-password-reset':
          await handlers.onSendPasswordReset?.(job.data);
          break;
        case 'cleanup-expired-sessions':
        case 'revoke-stale-tokens':
          await handlers.onCleanupExpiredSessions?.(job.data);
          break;
      }
    },
    { connection: redis }
  );
}
