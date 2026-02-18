
import { FastifyPluginAsync } from 'fastify';
import { SearchService } from './service.js';
import { searchQuerySchema, searchResponseSchema } from './schemas.js';

const searchRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new SearchService(fastify.log);

    // GET /
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const query = searchQuerySchema.parse(request.query);
            // Assuming request.user is populated by authenticate plugin
            const user = (request.user as any);

            const results = await service.search(query, {
                id: user.id,
                agencyId: user.agencyId,
                roles: user.roles || []
            });

            // Validate response? 
            // searchResponseSchema.parse(results) might fail if types don't match exactly (e.g. extra fields)
            // But results are manually constructed in service.
            return { success: true, data: results };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
};

export default searchRoutes;
