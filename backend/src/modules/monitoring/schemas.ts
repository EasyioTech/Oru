
import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { systemHealthMetrics, auditLogs, pageUsageAnalytics } from '../../infrastructure/database/schema.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';

export const healthMetricSchema = createSelectSchema(systemHealthMetrics);
export const auditLogSchema = createSelectSchema(auditLogs);
export const usageAnalyticsSchema = createSelectSchema(pageUsageAnalytics);

// Response schemas
export const healthMetricResponseSchema = healthMetricSchema.transform(data => mapToSnakeCase(data));
export const listHealthMetricsResponseSchema = z.object({
    metrics: z.array(healthMetricResponseSchema),
});

export const auditLogResponseSchema = auditLogSchema.transform(data => mapToSnakeCase(data));
export const listAuditLogsResponseSchema = z.object({
    logs: z.array(auditLogResponseSchema),
});

export const systemHealthSchema = z.object({
    status: z.string(),
    uptime: z.number(),
    timestamp: z.string(),
    system: z.object({
        loadAverage: z.array(z.number()),
        memory: z.object({
            total: z.number(),
            free: z.number(),
            used: z.number(),
            process: z.object({
                rss: z.number(),
                heapTotal: z.number(),
                heapUsed: z.number(),
                external: z.number(),
            }).optional(),
        }),
        disk: z.object({
            total: z.number(),
            free: z.number(),
            used: z.number(),
            path: z.string(),
        }).optional(),
        cpuCount: z.number(),
        platform: z.string(),
        nodeVersion: z.string(),
    }),
    services: z.object({
        database: z.object({
            status: z.string(),
            latency: z.number(),
        }),
        redis: z.object({
            status: z.string(),
            latency: z.number(),
        }),
        storage: z.object({
            status: z.string(),
            latency: z.number(),
            provider: z.string().optional(),
        }).optional(),
    }),
});
