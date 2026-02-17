
import { db } from '../../infrastructure/database/index.js';
import { redisConnection } from '../../infrastructure/redis/index.js';
import { systemHealthMetrics, auditLogs, pageUsageAnalytics } from '../../infrastructure/database/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError } from '../../utils/errors.js';
import os from 'os';
import { promises as fs } from 'fs';
import { s3Client } from '../../infrastructure/s3/index.js';
import { HeadBucketCommand } from '@aws-sdk/client-s3';

export class MonitoringService {
    constructor(private logger: FastifyBaseLogger) { }

    private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        let timeoutHandle: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
        });

        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
    }

    async getSystemHealth() {
        try {
            const startTime = Date.now();

            // 1. System Info
            const uptime = process.uptime();
            const memoryUsage = process.memoryUsage();
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const loadAvg = os.loadavg();

            // 2. Database Check
            let dbStatus = 'healthy';
            let dbLatency = 0;
            try {
                const dbStart = Date.now();
                // 2s timeout for DB
                await this.withTimeout(db.execute(sql`SELECT 1`), 2000);
                dbLatency = Date.now() - dbStart;
            } catch (error) {
                dbStatus = 'unhealthy';
                // Don't log full error for timeout to reduce noise
                this.logger.warn({ error: error instanceof Error ? error.message : error, context: 'dbHealthCheck' }, 'DB Check Warning');
            }

            // 3. Redis Check
            let redisStatus = 'healthy';
            let redisLatency = 0;
            try {
                if (redisConnection.status !== 'ready') {
                    throw new Error(`Redis not ready: ${redisConnection.status}`);
                }
                const redisStart = Date.now();
                // 1s timeout for Redis
                await this.withTimeout(redisConnection.ping(), 1000);
                redisLatency = Date.now() - redisStart;
            } catch (error) {
                redisStatus = 'unhealthy';
                this.logger.warn({ error: error instanceof Error ? error.message : error, context: 'redisHealthCheck' }, 'Redis Check Warning');
            }

            return {
                status: (dbStatus === 'healthy' && redisStatus === 'healthy') ? 'healthy' : 'degraded',
                uptime,
                timestamp: new Date().toISOString(),
                system: {
                    loadAverage: loadAvg,
                    memory: {
                        total: totalMem,
                        free: freeMem,
                        used: totalMem - freeMem,
                        process: memoryUsage,
                    },
                    disk: await this.getDiskUsage(),
                    cpuCount: os.cpus().length,
                    platform: os.platform(),
                    nodeVersion: process.version,
                },
                services: {
                    database: {
                        status: dbStatus,
                        latency: dbLatency,
                    },
                    redis: {
                        status: redisStatus,
                        latency: redisLatency,
                    },
                    storage: await this.getStorageHealth(),
                },
            };
        } catch (error) {
            this.logger.error({ error, context: 'getSystemHealth' });
            // Always return structure even on crash, but marked as degraded
            return {
                status: 'degraded',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                system: {
                    loadAverage: [],
                    memory: { total: 0, free: 0, used: 0, process: {} },
                    cpuCount: 0,
                    platform: 'unknown',
                    nodeVersion: 'unknown',
                },
                services: {
                    database: { status: 'unknown', latency: 0 },
                    redis: { status: 'unknown', latency: 0 },
                },
            };
        }
    }

    async getLatestHealth() {
        try {
            return await db.select().from(systemHealthMetrics)
                .orderBy(desc(systemHealthMetrics.timestamp))
                .limit(20);
        } catch (error) {
            this.logger.error({ error, context: 'getLatestHealth' });
            throw new AppError('Failed to fetch health metrics');
        }
    }

    async getAuditLogs(limit = 50, offset = 0) {
        try {
            return await db.select().from(auditLogs)
                .orderBy(desc(auditLogs.createdAt))
                .limit(limit)
                .offset(offset);
        } catch (error) {
            this.logger.error({ error, context: 'getAuditLogs' });
            throw new AppError('Failed to fetch audit logs');
        }
    }

    async getUsageAnalytics(limit = 50) {
        try {
            return await db.select().from(pageUsageAnalytics)
                .orderBy(desc(pageUsageAnalytics.date))
                .limit(limit);
        } catch (error) {
            this.logger.error({ error, context: 'getUsageAnalytics' });
            throw new AppError('Failed to fetch usage analytics');
        }
    }

    private async getDiskUsage() {
        try {
            // Check usage of the root volume or current working directory volume
            const path = process.cwd();
            // Node 18.15+ supports statsfs
            if ((fs as any).statfs) {
                const stats = await (fs as any).statfs(path);
                const total = stats.blocks * stats.bsize;
                const free = stats.bfree * stats.bsize;
                const used = total - free;
                return { total, free, used, path };
            }
            return undefined;
        } catch (error) {
            this.logger.warn({ error, context: 'getDiskUsage' }, 'Disk Check Warning');
            return undefined;
        }
    }

    private async getStorageHealth() {
        try {
            const bucket = process.env.AWS_S3_BUCKET;
            if (!bucket) return undefined;

            const start = Date.now();
            await this.withTimeout(
                s3Client.send(new HeadBucketCommand({ Bucket: bucket })),
                3000
            );
            const latency = Date.now() - start;

            return {
                status: 'healthy',
                latency,
                provider: process.env.AWS_S3_ENDPOINT?.includes('r2.cloudflarestorage')
                    ? 'Cloudflare R2'
                    : process.env.AWS_S3_ENDPOINT ? 'Custom S3' : 'AWS S3'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                latency: 0,
                provider: 'Unknown'
            };
        }
    }
}
