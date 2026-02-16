
import { FastifyPluginAsync } from 'fastify';
import { PlansService } from './service.js';
import { listPlansResponseSchema, planResponseSchema, listFeaturesResponseSchema, featureResponseSchema } from './schemas.js';
import { ForbiddenError } from '../../utils/errors.js';

const planRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new PlansService(fastify.log);

    // List Plans
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'Catalog')) {
                throw new ForbiddenError();
            }

            const plans = await service.listPlans();
            const response = listPlansResponseSchema.parse({ plans });
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Create Plan
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'Catalog')) {
                throw new ForbiddenError();
            }

            const rawPlan = await service.createPlan(request.body);
            const response = planResponseSchema.parse(rawPlan);
            return reply.code(201).send({ success: true, data: response });
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Update Plan
    fastify.put('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('update', 'Catalog')) {
                throw new ForbiddenError();
            }

            const rawPlan = await service.updatePlan(id, request.body);
            const response = planResponseSchema.parse(rawPlan);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
    // List Features
    fastify.get('/features', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const features = await service.listFeatures();
            const response = listFeaturesResponseSchema.parse({ features });
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Create Feature
    fastify.post('/features', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'Catalog')) {
                throw new ForbiddenError();
            }

            const rawFeature = await service.createFeature(request.body);
            const response = featureResponseSchema.parse(rawFeature);
            return reply.code(201).send({ success: true, data: response });
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Update Feature
    fastify.put('/features/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('update', 'Catalog')) {
                throw new ForbiddenError();
            }

            const rawFeature = await service.updateFeature(id, request.body);
            const response = featureResponseSchema.parse(rawFeature);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Delete Feature
    fastify.delete('/features/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('delete', 'Catalog')) {
                throw new ForbiddenError();
            }

            await service.deleteFeature(id);
            return { success: true, message: 'Feature deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
};

export default planRoutes;
