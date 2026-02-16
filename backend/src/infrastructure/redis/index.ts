
import { Redis } from 'ioredis';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
    // Prevent unhandled error event crashes
    console.error('[Redis] Connection error:', err.message);
});

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate('redis', redisConnection);

    fastify.addHook('onClose', async (instance) => {
        await redisConnection.quit();
    });
});
