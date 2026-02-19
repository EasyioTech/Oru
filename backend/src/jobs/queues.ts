
import { Queue } from 'bullmq';
import { QUEUES } from './definitions.js';

import { getRedisConnection } from '../infrastructure/redis/index.js';

const connection = getRedisConnection();

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
