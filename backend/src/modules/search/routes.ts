import { FastifyPluginAsync } from 'fastify';
import { INDEXES } from '../../infrastructure/meilisearch/index.js';

const searchRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { q, index } = request.query as { q?: string; index?: string };
        const user = request.user;

        if (!q || q.length < 2) {
            return { success: true, data: [] };
        }

        if (!index || !Object.values(INDEXES).includes(index as any)) {
            return reply.status(400).send({ error: true, message: 'Invalid index' });
        }
        
        if (!user.agencyId) {
            return reply.status(403).send({ error: true, message: 'Agency context required' });
        }

        const hits = await fastify.meilisearch.query(index, q, user.agencyId);
        
        return { success: true, data: hits };
    });
};

export default searchRoutes;
