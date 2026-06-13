import { Redis, RedisOptions } from 'ioredis';
import { ConnectionOptions } from 'bullmq';

export const getRedisConnection = (): ConnectionOptions => {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379');
    const isWindows = process.platform === 'win32';
    const finalHost = (isWindows && host === 'redis') ? 'localhost' : host;

    return {
        host: finalHost,
        port,
        password: process.env.REDIS_PASSWORD || undefined,
        // Give up after 3 attempts — Redis is optional in dev
        retryStrategy: (times: number) => times > 3 ? null : Math.min(times * 200, 2000),
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        lazyConnect: true,
    } as any;
};

export const redisConnection = new Redis(getRedisConnection() as RedisOptions);

// Suppress unhandled error spam — Redis is optional
redisConnection.on('error', () => {});
redisConnection.on('ready', () => console.log('[Redis] ✅ Connected'));
