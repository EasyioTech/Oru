
import { Redis } from 'ioredis';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    lazyConnect: true, // Don't crash on initial connection failure
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.slice(0, targetError.length) === targetError) {
            return true;
        }
        return false;
    }
});

redisConnection.on('error', (err) => {
    // Prevent unhandled error event crashes and log with context
    // Use console.error since we don't have access to global logger here
    if (process.env.NODE_ENV !== 'test') {
        console.error('[Redis] Connection error:', err.message);
    }
});

redisConnection.on('connect', () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('[Redis] Connected successfully');
    }
});

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate('redis', redisConnection);

    fastify.addHook('onClose', async (instance) => {
        await redisConnection.quit();
    });
});
