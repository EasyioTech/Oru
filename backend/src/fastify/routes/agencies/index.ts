import { FastifyPluginAsync } from 'fastify';
import { agencies } from '../../../infrastructure/database/schema.js';
import { desc } from 'drizzle-orm';

const agencyRoutes: FastifyPluginAsync = async (fastify) => {
    /**
     * List all agencies (Control Plane)
     */
    fastify.get('/', async (request, reply) => {
        try {
            const allAgencies = await request.db
                .select()
                .from(agencies)
                .orderBy(desc(agencies.createdAt));

            return {
                success: true,
                data: allAgencies
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Failed to fetch agencies',
                error: error.message
            });
        }
    });

    /**
     * Get specific agency details
     */
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };

        // In a real app, we'd use a uuid check here

        try {
            const agency = await request.db.query.agencies.findFirst({
                where: (agencies, { eq }) => eq(agencies.id, id)
            });

            if (!agency) {
                return reply.status(404).send({
                    success: false,
                    message: 'Agency not found'
                });
            }

            return {
                success: true,
                data: agency
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Error fetching agency details',
                error: error.message
            });
        }
    });
};

export default agencyRoutes;
