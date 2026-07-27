import { FastifyPluginAsync } from 'fastify';
import { SystemService } from './service.js';
import { getSettingsResponseSchema, updateSystemSettingsSchema, emailTestRequestSchema, getSeoSettingsResponseSchema } from './schemas.js';
import { sendSystemEmail } from '../../infrastructure/email/index.js';
import { ForbiddenError } from '../../utils/errors.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';
import plansRoutes from './routes/plans.routes.js';
import featuresRoutes from './routes/features.routes.js';

const systemRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new SystemService(fastify.db);

    await fastify.register(plansRoutes);
    await fastify.register(featuresRoutes);

    fastify.get('/seo-settings', async () => {
        const data = await service.getSeoSettings();
        return { success: true, data: getSeoSettingsResponseSchema.parse(data) };
    });

    fastify.get('/signup-preflight', async () => {
        const data = await service.getSignupPreflight();
        return { success: true, data };
    });

    fastify.get('/agencies/:id/data', { onRequest: [fastify.authenticate] }, async (request) => {
        const { id } = request.params as { id: string };
        if (!request.ability.can('read', 'System')) throw new ForbiddenError('Super Admin access required');
        const rawData = await service.getAgencyData(id);
        return { success: true, data: mapToSnakeCase(rawData) };
    });

    fastify.get('/metrics', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('read', 'System')) throw new ForbiddenError('Super Admin access required');
        return { success: true, data: await service.getMetrics() };
    });

    fastify.get('/settings', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('read', 'System')) throw new ForbiddenError('Super Admin access required');
        const rawData = await service.getSettings();
        return { success: true, data: getSettingsResponseSchema.parse({ settings: rawData }) };
    });

    fastify.put('/settings', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('update', 'System')) throw new ForbiddenError('Super Admin access required');
        const validatedBody = updateSystemSettingsSchema.parse(request.body);
        const rawData = await service.updateSettings(validatedBody);
        return { success: true, data: getSettingsResponseSchema.parse({ settings: rawData }) };
    });

    fastify.post('/email/test', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('create', 'System')) throw new ForbiddenError('Super Admin access required');
        const { to } = emailTestRequestSchema.parse(request.body);
        const info = await sendSystemEmail(to, 'Oru ERP - System Test Email', `
            <h1>System Email Test</h1>
            <p>Time: ${new Date().toISOString()}</p>
        `);
        return { success: true, data: { messageId: info.messageId } };
    });

    fastify.get('/branding', async () => {
        const data = await service.getBranding();
        return { success: true, data: mapToSnakeCase(data) };
    });

    fastify.get('/usage/realtime', { onRequest: [fastify.authenticate] }, async () => {
        try {
            const data = await service.getRealtimeUsage();
            return { success: true, data: mapToSnakeCase(data) };
        } catch {
            return { success: true, data: { activeUsers: 0, activeSessions: 0, requestsPerSecond: 0, timestamp: new Date().toISOString() } };
        }
    });

    fastify.get('/health/detailed', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('read', 'System')) throw new ForbiddenError('Super Admin access required');
        return { success: true, data: await service.getDetailedHealth() };
    });
};

export default systemRoutes;
