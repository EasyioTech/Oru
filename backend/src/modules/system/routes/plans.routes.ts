import { FastifyPluginAsync } from 'fastify';
import { PlansService } from '../../plans/service.js';
import { ForbiddenError } from '../../../utils/errors.js';
import { mapToSnakeCase } from '../../../utils/case-transform.js';

const plansRoutes: FastifyPluginAsync = async (fastify) => {
    const getService = () => new PlansService(fastify.log);

    fastify.get('/plans', { onRequest: [fastify.authenticate] }, async () => {
        const plans = await getService().listPlans();
        return { success: true, data: { plans: (Array.isArray(plans) ? plans : []).map(p => mapToSnakeCase(p)) } };
    });

    fastify.post('/plans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (!request.ability.can('create', 'System')) throw new ForbiddenError();
        const plan = await getService().createPlan(request.body);
        return reply.code(201).send({ success: true, data: { plan: mapToSnakeCase(plan) } });
    });

    fastify.put('/plans/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('update', 'System')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        const plan = await getService().updatePlan(id, request.body);
        return { success: true, data: { plan: mapToSnakeCase(plan) } };
    });

    fastify.delete('/plans/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('delete', 'System')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await getService().deletePlan(id);
        return { success: true };
    });
};

export default plansRoutes;
