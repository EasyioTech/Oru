
import { FastifyPluginAsync } from 'fastify';
import { AgenciesService } from './service.js';
import { listAgenciesResponseSchema, agencyResponseSchema } from './schemas.js';
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

    // Create Agency
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to create agency');
            }

            const rawAgency = await service.createAgency(request.body);
            const response = agencyResponseSchema.parse(rawAgency);
            return reply.code(201).send({ success: true, data: response });
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

            const rawAgency = await service.updateAgency(id, request.body);
            const response = agencyResponseSchema.parse(rawAgency);
            return { success: true, data: response };
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
