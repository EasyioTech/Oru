import { FastifyPluginAsync } from 'fastify';
import { SystemService } from '../service.js';
import { createFeatureSchema, updateFeatureSchema, ticketsQuerySchema } from '../schemas.js';
import { ForbiddenError } from '../../../utils/errors.js';
import { mapToSnakeCase } from '../../../utils/case-transform.js';

const featuresRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new SystemService(fastify.db);

    fastify.get('/tickets', { onRequest: [fastify.authenticate] }, async (request) => {
        const query = ticketsQuerySchema.parse(request.query);
        const data = await service.getTickets(query);
        return { success: true, data: mapToSnakeCase(data) };
    });

    fastify.get('/tickets/summary', { onRequest: [fastify.authenticate] }, async () => {
        const data = await service.getTicketsSummary();
        return { success: true, data: mapToSnakeCase(data) };
    });

    fastify.get('/features', { onRequest: [fastify.authenticate] }, async () => {
        const data = await service.getSystemFeatures();
        return { success: true, data: mapToSnakeCase(data) };
    });

    fastify.post('/features', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (!request.ability.can('create', 'System')) throw new ForbiddenError();
        const validated = createFeatureSchema.parse(request.body);
        const feature = await service.createFeature(validated);
        return reply.code(201).send({ success: true, data: { feature: mapToSnakeCase(feature) } });
    });

    fastify.put('/features/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('update', 'System')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        const validated = updateFeatureSchema.parse(request.body);
        const feature = await service.updateFeature(id, validated);
        return { success: true, data: { feature: mapToSnakeCase(feature) } };
    });

    fastify.delete('/features/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('delete', 'System')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await service.deleteFeature(id);
        return { success: true };
    });
};

export default featuresRoutes;
