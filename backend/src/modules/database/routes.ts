
import { FastifyPluginAsync } from 'fastify';
import { DatabaseService } from './service.js';
import { ForbiddenError } from '../../utils/errors.js';
import { z } from 'zod';

const databaseRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new DatabaseService(fastify.log);

    // POST /query
    fastify.post('/query', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            // Strict check for super_admin
            if (!request.user.roles.includes('super_admin')) {
                throw new ForbiddenError('Only Super Admin can execute raw queries');
            }

            const schema = z.object({
                query: z.string(),
                params: z.array(z.any()).optional(),
            });

            const { query, params } = schema.parse(request.body);

            const result = await service.executeQuery(query, params);

            // Ensure result is always an array
            const safeResult = Array.isArray(result) ? result : [];

            return { success: true, data: safeResult };
        } catch (error: any) {
            fastify.log.error({ error: error.message, context: 'POST /database/query' });

            // Return appropriate error response
            if (error instanceof ForbiddenError) {
                return reply.code(403).send({
                    success: false,
                    error: 'Forbidden',
                    message: error.message
                });
            }

            // Return empty result on error to prevent dashboard crash
            return { success: true, data: [] };
        }
    });
};

export default databaseRoutes;
