import { Redis, RedisOptions } from 'ioredis';
import { ConnectionOptions } from 'bullmq';

/**
 * Smart Redis Connection Helper
 * Automatically fallbacks to localhost if 'redis' host is not resolvable 
 * (helps development without Docker)
 */
export const getRedisConnection = (): ConnectionOptions => {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379');

    // If we are on Windows or explicitly running outside Docker, 
    // and host is 'redis', we likely want localhost
    const isWindows = process.platform === 'win32';
    const finalHost = (isWindows && host === 'redis') ? 'localhost' : host;

    return {
        host: finalHost,
        port: port,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times: number) => {
            return Math.min(times * 50, 2000);
        }
    } as any; // Cast to any to satisfy both BullMQ and ioredis types
};

// Singleton instance for the rest of the app (Health checks, etc)
export const redisConnection = new Redis(getRedisConnection() as RedisOptions);
