
import { Queue } from 'bullmq';
import { QUEUES } from './definitions.js';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
};

export const agencyProvisioningQueue = new Queue(QUEUES.AGENCY_PROVISIONING, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true, // Keep history clean
        removeOnFail: false, // Keep failed jobs for inspection
    },
});
