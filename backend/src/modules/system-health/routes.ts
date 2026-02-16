

import { FastifyPluginAsync } from 'fastify';
import { db } from '../../infrastructure/database/index.js';
import { systemHealthMetrics } from '../../infrastructure/database/schema.js';
import { desc } from 'drizzle-orm';
import { mapToSnakeCase } from '../../utils/case-transform.js';

const systemHealthRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const [latestHealth] = await db
                .select()
                .from(systemHealthMetrics)
                .orderBy(desc(systemHealthMetrics.timestamp))
                .limit(1);

            return {
                success: true,
                data: latestHealth ? mapToSnakeCase(latestHealth) : null
            };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system-health' });
            // Return null data on error to prevent dashboard crash
            return {
                success: true,
                data: null
            };
        }
    });
};

export default systemHealthRoutes;
