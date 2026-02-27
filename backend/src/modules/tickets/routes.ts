import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { TicketsService } from './service.js';
import { defineAbilitiesForTickets } from './abilities.js';
import { ForbiddenError } from '../../utils/errors.js';

const ticketsRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new TicketsService(fastify.log);

    // GET / - List all tickets
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const ability = defineAbilitiesForTickets(request.user);
            if (!ability.can('read', 'Ticket')) {
                throw new ForbiddenError('You do not have permission to view tickets');
            }

            const querySchema = z.object({
                limit: z.coerce.number().optional().default(100),
                offset: z.coerce.number().optional().default(0),
                status: z.string().optional(),
            });

            const filters = querySchema.parse(request.query);
            const data = await service.listTickets(filters);

            return { success: true, data };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // GET /stats - Ticket statistics
    fastify.get('/stats', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const ability = defineAbilitiesForTickets(request.user);
            if (!ability.can('read', 'Ticket')) {
                throw new ForbiddenError('You do not have permission to view ticket stats');
            }

            const data = await service.getTicketStats();
            return { success: true, data };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // GET /summary - Ticket summary (stats + recent)
    fastify.get('/summary', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const ability = defineAbilitiesForTickets(request.user);
            if (!ability.can('read', 'Ticket')) {
                throw new ForbiddenError();
            }

            const data = await service.getTicketSummary();
            return { success: true, data };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // POST /public - Create public ticket
    fastify.post('/public', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        // Same as create ticket but different route for frontend compatibility
        // Assuming /public means "publicly available form" but still needs auth?
        // Frontend uses authHeaders() so user is authenticated.
        try {
            const ability = defineAbilitiesForTickets(request.user);
            if (!ability.can('create', 'Ticket')) {
                throw new ForbiddenError();
            }

            const input = {
                ...(request.body as object),
                userId: request.user?.id,
                agencyId: (request.body as any).agencyId || request.user?.agencyId
            };

            const data = await service.createTicket(input);
            return reply.code(201).send({ success: true, data });
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // GET /:id - Get specific ticket
    fastify.get('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const ability = defineAbilitiesForTickets(request.user);
            if (!ability.can('read', 'Ticket')) {
                throw new ForbiddenError('You do not have permission to view tickets');
            }

            const data = await service.getTicket(id);
            return { success: true, data };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // POST / - Create ticket
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const ability = defineAbilitiesForTickets(request.user);
            if (!ability.can('create', 'Ticket')) {
                throw new ForbiddenError('You do not have permission to create tickets');
            }

            const input = {
                ...(request.body as object),
                userId: request.user?.id,
                agencyId: (request.body as any).agencyId || request.user?.agencyId
            };

            const data = await service.createTicket(input);
            return reply.code(201).send({ success: true, data });
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // PUT /:id - Update ticket
    fastify.put('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const ability = defineAbilitiesForTickets(request.user);
            if (!ability.can('update', 'Ticket')) {
                throw new ForbiddenError('You do not have permission to update tickets');
            }

            const data = await service.updateTicket(id, request.body);
            return { success: true, data };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // DELETE /:id - Delete ticket
    fastify.delete('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const ability = defineAbilitiesForTickets(request.user);
            if (!ability.can('delete', 'Ticket')) {
                throw new ForbiddenError('You do not have permission to delete tickets');
            }

            const data = await service.deleteTicket(id);
            return { success: true, data };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
};

export default ticketsRoutes;
