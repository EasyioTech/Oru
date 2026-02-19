
import { Worker } from 'bullmq';
import { QUEUES } from './definitions.js';
import { processAgencyProvisioning } from './processors/agency-provisioning.job.js';
import { FastifyBaseLogger } from 'fastify';

import { getRedisConnection } from '../infrastructure/redis/index.js';

const connection = getRedisConnection();

export function initWorkers(logger?: FastifyBaseLogger) {
    const agencyWorker = new Worker(QUEUES.AGENCY_PROVISIONING, processAgencyProvisioning, {
        connection,
        concurrency: 5, // Process up to 5 agencies at once
        limiter: {
            max: 10,
            duration: 1000,
        },
    });

    agencyWorker.on('ready', () => {
        if (logger) {
            logger.info({ queue: QUEUES.AGENCY_PROVISIONING }, 'Worker ready and connected to Redis');
        }
    });

    agencyWorker.on('completed', (job) => {
        if (logger) {
            logger.info({ jobId: job.id, queue: QUEUES.AGENCY_PROVISIONING }, 'Job completed successfully');
        }
    });

    agencyWorker.on('failed', (job, err) => {
        if (logger) {
            logger.error({ jobId: job?.id, queue: QUEUES.AGENCY_PROVISIONING, err: err.message, stack: err.stack }, 'Job failed');
        }
    });

    agencyWorker.on('error', (err) => {
        if (logger) {
            logger.error({ queue: QUEUES.AGENCY_PROVISIONING, err: err.message }, 'Worker error');
        }
    });

    if (logger) {
        const conn = connection as any;
        logger.info({
            msg: '👷 Job Workers Initializing',
            redisHost: conn.host,
            redisPort: conn.port
        });
    }

    return [agencyWorker];
}
