
import { FastifyPluginAsync } from 'fastify';

const emailRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /email/status - Get email system status
    fastify.get('/status', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            // Return mock email status for now
            // TODO: Implement actual email service integration
            return {
                success: true,
                data: {
                    status: 'operational',
                    lastCheck: new Date().toISOString(),
                    queueSize: 0,
                    sent24h: 0,
                    failed24h: 0,
                    provider: 'smtp',
                }
            };
        } catch (error: any) {
            fastify.log.error({ error: error.message, context: 'GET /email/status' });
            // Return safe default on error
            return {
                success: true,
                data: {
                    status: 'unknown',
                    lastCheck: new Date().toISOString(),
                    queueSize: 0,
                    sent24h: 0,
                    failed24h: 0,
                    provider: 'smtp',
                }
            };
        }
    });
};

export default emailRoutes;
