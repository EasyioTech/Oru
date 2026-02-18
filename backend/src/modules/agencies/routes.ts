
import { FastifyPluginAsync } from 'fastify';
import { AgenciesService } from './service.js';
import { listAgenciesResponseSchema, agencyResponseSchema, createAgencySchema, updateAgencySchema, completeAgencySetupSchema, provisionAgencySchema } from './schemas.js';
import { ForbiddenError } from '../../utils/errors.js';

const agencyRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new AgenciesService(fastify.log);

    // List Agencies
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to list agencies');
            }

            const rawAgencies = await service.listAgencies();
            const response = listAgenciesResponseSchema.parse({ agencies: rawAgencies });
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Check Domain Availability (Public)
    // MUST BE BEFORE /:id because "check-domain" matches :id pattern
    fastify.get('/check-domain', async (request, reply) => {
        try {
            const domain = (request.query as { domain: string }).domain;
            const result = await service.checkDomainAvailability(domain);
            return result;
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Get Agency
    fastify.get('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('read', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to view agency');
            }

            const rawAgency = await service.getAgency(id);
            const response = agencyResponseSchema.parse(rawAgency);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Create Agency (Public Registration)
    fastify.post('/create', async (request, reply) => {
        try {
            const validated = provisionAgencySchema.parse(request.body);
            const result = await service.provisionAgency(validated);
            return reply.code(201).send({ success: true, data: result }); // Frontend expects { success: true, ... } or data wrapper?
            // Frontend: const result = await response.json(); if (!result.success) ...
            // So structure should be { success: true, ... }
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Create Agency (Internal/Admin)
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to create agency');
            }

            // TODO: Import CreateAgencyInput from schemas
            const validated = createAgencySchema.parse(request.body);
            const rawAgency = await service.createAgency(validated);
            const response = agencyResponseSchema.parse(rawAgency);
            return reply.code(201).send({ success: true, data: response });
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Complete Agency Setup
    fastify.post('/complete-setup', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            // Check permissions - 'create' 'Agency' or similar
            if (!request.ability.can('create', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to setup agency');
            }

            // TODO: Import CompleteAgencySetupInput from schemas
            const validated = completeAgencySetupSchema.parse(request.body);
            const result = await service.completeAgencySetup(validated);
            return { success: true, data: result };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Update Agency
    fastify.put('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('update', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to update agency');
            }

            // TODO: Import UpdateAgencyInput
            const validated = updateAgencySchema.parse(request.body);
            const rawAgency = await service.updateAgency(id, validated);
            const response = agencyResponseSchema.parse(rawAgency);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Check Setup Status
    fastify.get('/check-setup', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const { database } = request.query as { database: string };
            const isComplete = await service.isSetupComplete(database);
            return { success: true, data: { setupComplete: isComplete } };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Delete Agency
    fastify.delete('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('delete', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to delete agency');
            }

            await service.deleteAgency(id);
            return { success: true, message: 'Agency deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
};

export default agencyRoutes;
