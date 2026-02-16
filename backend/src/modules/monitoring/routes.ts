
import { FastifyPluginAsync } from 'fastify';
import { MonitoringService } from './service.js';
import { listHealthMetricsResponseSchema, listAuditLogsResponseSchema, usageAnalyticsSchema, systemHealthSchema } from './schemas.js';
import { z } from 'zod';
import { ForbiddenError } from '../../utils/errors.js';

const monitoringRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new MonitoringService(fastify.log);

    // Get Health Stats
    fastify.get('/health-stats', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'System')) {
                throw new ForbiddenError();
            }

            const metrics = await service.getLatestHealth();
            const response = listHealthMetricsResponseSchema.parse({ metrics });
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Get Audit Logs
    fastify.get('/audit-logs', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'System')) {
                throw new ForbiddenError();
            }

            const logs = await service.getAuditLogs();
            const response = listAuditLogsResponseSchema.parse({ logs });
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Get Analytics
    fastify.get('/analytics', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'System')) {
                throw new ForbiddenError();
            }

            const analytics = await service.getUsageAnalytics();
            const response = z.array(usageAnalyticsSchema).parse(analytics);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
    // Get Live Health
    fastify.get('/live-health', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'System')) {
                throw new ForbiddenError();
            }

            const health = await service.getSystemHealth();
            const response = systemHealthSchema.parse(health);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
};

export default monitoringRoutes;
