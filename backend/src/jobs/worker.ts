import { FastifyBaseLogger } from 'fastify';
import { getRedisConnection } from '../infrastructure/redis/index.js';

const connection = getRedisConnection();

export function initWorkers(logger?: FastifyBaseLogger) {
    if (logger) {
        const conn = connection as any;
        logger.info({
            msg: '👷 Job Workers Initializing (No active workers yet)',
            redisHost: conn.host,
            redisPort: conn.port
        });
    }

    return [];
}
