
import { Worker } from 'bullmq';
import { QUEUES } from './definitions.js';
import { processAgencyProvisioning } from './processors/agency-provisioning.job.js';
import { FastifyBaseLogger } from 'fastify';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
};

export function initWorkers(logger?: FastifyBaseLogger) {
    const agencyWorker = new Worker(QUEUES.AGENCY_PROVISIONING, processAgencyProvisioning, {
        connection,
        concurrency: 5, // Process up to 5 agencies at once
        limiter: {
            max: 10,
            duration: 1000,
        },
    });

    agencyWorker.on('completed', (job) => {
        if (logger) {
            logger.info({ jobId: job.id, queue: QUEUES.AGENCY_PROVISIONING }, 'Job completed successfully');
        }
    });

    agencyWorker.on('failed', (job, err) => {
        if (logger) {
            logger.error({ jobId: job?.id, queue: QUEUES.AGENCY_PROVISIONING, err: err.message }, 'Job failed');
        }
    });

    if (logger) {
        logger.info('👷 Job Workers Initialized');
    }

    return [agencyWorker];
}
