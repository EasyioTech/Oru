import { FastifyPluginAsync } from 'fastify';
import { AgencySettingsService } from '../services/settings.service.js';
import { AgencyProvisioningService } from '../services/provisioning.service.js';
import { ForbiddenError } from '../../../utils/errors.js';
import { mapToSnakeCase } from '../../../utils/case-transform.js';

const agencySettingsRoutes: FastifyPluginAsync = async (fastify) => {
    const settingsService = new AgencySettingsService(fastify.log);
    const provisioningService = new AgencyProvisioningService(fastify.log);

    fastify.get('/me/dashboard', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const agencyId = (request as any).user?.agencyId;
        if (!agencyId) return reply.status(400).send({ success: false, error: 'No agency context in token' });
        try {
            const data = await settingsService.getDashboardMetrics(agencyId);
            return { success: true, data };
        } catch (error) {
            fastify.log.error({ error, context: 'dashboard metrics' });
            return reply.status(500).send({ success: false, error: 'Failed to load dashboard metrics' });
        }
    });

    fastify.get('/:id/users', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        if (!request.ability.can('read', 'Agency')) throw new ForbiddenError('Insufficient permissions to view agency users');
        const agencyUsers = await settingsService.getAgencyUsers(id);
        return { success: true, data: { users: agencyUsers } };
    });

    fastify.get('/:id/usage', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        if (!request.ability.can('read', 'Agency')) throw new ForbiddenError('Insufficient permissions to view agency usage');
        const usage = await settingsService.getAgencyUsage(id);
        return { success: true, data: { usage } };
    });

    fastify.post('/:id/export-backup', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (!request.ability.can('read', 'Agency')) throw new ForbiddenError('Insufficient permissions');
        return reply.code(501).send({ success: false, message: 'Export backup not yet supported.' });
    });

    fastify.get('/provisioning/:jobId', async (request, reply) => {
        const { jobId } = request.params as { jobId: string };
        const result = await provisioningService.getProvisioningStatus(jobId);
        return { success: true, data: result };
    });

    fastify.get('/agency-settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { agencyId } = request.query as { agencyId: string };
        if (!agencyId) return reply.code(400).send({ success: false, message: 'agencyId is required' });
        if (request.user.agencyId !== agencyId && !request.user.roles.includes('super_admin')) {
            throw new ForbiddenError('Insufficient permissions');
        }
        const settings = await settingsService.getAgencySettings(agencyId);
        return { success: true, data: { settings: mapToSnakeCase(settings) } };
    });

    fastify.put('/agency-settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { agencyId, settings } = request.body as { agencyId: string; settings: any };
        if (!agencyId) return reply.code(400).send({ success: false, message: 'agencyId is required' });
        if (request.user.agencyId !== agencyId && !request.user.roles.includes('super_admin')) {
            throw new ForbiddenError('Insufficient permissions');
        }
        if (!request.ability.can('update', 'Agency')) throw new ForbiddenError('Insufficient permissions to update settings');
        const result = await settingsService.updateAgencySettings(agencyId, settings);
        return { success: true, data: { settings: mapToSnakeCase(result) } };
    });
};

export default agencySettingsRoutes;
