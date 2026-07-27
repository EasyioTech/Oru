import { FastifyPluginAsync } from 'fastify';
import { AgenciesService } from './service.js';
import { AgencyProvisioningService } from './services/provisioning.service.js';
import { listAgenciesResponseSchema, agencyResponseSchema, createAgencySchema, updateAgencySchema, completeAgencySetupSchema, provisionAgencySchema } from './schemas.js';
import { ForbiddenError } from '../../utils/errors.js';
import agencySettingsRoutes from './routes/settings.routes.js';

const agencyRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new AgenciesService(fastify.log);
    const provisioning = new AgencyProvisioningService(fastify.log);

    // Register settings sub-routes (dashboard, users, usage, agency-settings, provisioning)
    await fastify.register(agencySettingsRoutes);

    // Check Domain Availability (Public) — must be before /:id
    fastify.get('/check-domain', async (request) => {
        const domain = (request.query as { domain: string }).domain;
        return service.checkDomainAvailability(domain);
    });

    // List Agencies
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('read', 'Agency')) throw new ForbiddenError('Insufficient permissions to list agencies');
        const rawAgencies = await service.listAgencies();
        const response = listAgenciesResponseSchema.parse({ agencies: rawAgencies });
        return { success: true, data: response };
    });

    // Get Agency
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        const { id } = request.params as { id: string };
        if (!request.ability.can('read', 'Agency')) throw new ForbiddenError('Insufficient permissions to view agency');
        const rawAgency = await service.getAgency(id);
        return { success: true, data: agencyResponseSchema.parse(rawAgency) };
    });

    // Public Registration
    fastify.post('/create', async (request, reply) => {
        const validated = provisionAgencySchema.parse(request.body);
        const result = await provisioning.provisionAgency(validated);
        return reply.code(202).send(result);
    });

    // Create Agency (Internal/Admin)
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (!request.ability.can('create', 'Agency')) throw new ForbiddenError('Insufficient permissions to create agency');
        const validated = createAgencySchema.parse(request.body);
        const rawAgency = await provisioning.createAgency(validated);
        return reply.code(201).send({ success: true, data: agencyResponseSchema.parse(rawAgency.agency) });
    });

    // Complete Agency Setup
    fastify.post('/complete-setup', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (!request.ability.can('create', 'Agency')) throw new ForbiddenError('Insufficient permissions to setup agency');
        const validated = completeAgencySetupSchema.parse(request.body);
        const result = await provisioning.completeAgencySetup(validated);
        return reply.code(202).send(result);
    });

    // Update Agency
    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        const { id } = request.params as { id: string };
        if (!request.ability.can('update', 'Agency')) throw new ForbiddenError('Insufficient permissions to update agency');
        const validated = updateAgencySchema.parse(request.body);
        const rawAgency = await service.updateAgency(id, validated);
        return { success: true, data: agencyResponseSchema.parse(rawAgency) };
    });

    // Check Setup Status
    fastify.get('/check-setup', { onRequest: [fastify.authenticate] }, async (request) => {
        const { domain } = request.query as { domain: string };
        const isComplete = await service.isSetupComplete(domain);
        return { success: true, data: { setupComplete: isComplete } };
    });

    // Delete Agency
    fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        const { id } = request.params as { id: string };
        if (!request.ability.can('delete', 'Agency')) throw new ForbiddenError('Insufficient permissions to delete agency');
        await service.deleteAgency(id);
        return { success: true, message: 'Agency deleted successfully' };
    });
};

export default agencyRoutes;
