import { FastifyPluginAsync } from 'fastify';
import { StorageService } from './service.js';
import { ForbiddenError, AppError } from '../../utils/errors.js';
import { z } from 'zod';

const storageRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new StorageService(fastify.log);

    fastify.post('/upload', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            // Check if user is logged in
            if (!request.user) {
                // If using fastify-jwt/auth plugin, this might be handled automatically by onRequest
                // But double check doesn't hurt or use ability check
            }

            const data = await request.file();
            if (!data) {
                throw new AppError('No file uploaded', 400, 'NO_FILE_UPLOADED');
            }

            const context = (request.query as any).context || 'general';

            // Construct base URL from request to ensure correct absolute URL return
            // This handles localhost:5001 vs production domains automatically
            const baseUrl = `${request.protocol}://${request.host}`;

            const result = await service.uploadFile(data, context, baseUrl);

            return {
                success: true,
                data: result
            };

        } catch (error) {
            fastify.log.error(error);
            // Return error response structure per AI_RULES
            const status = error instanceof AppError ? error.statusCode : 500;
            reply.status(status).send({
                success: false,
                error: (error as AppError).code || 'UploadError',
                message: (error as Error).message || 'File upload failed'
            });
        }
    });
};

export default storageRoutes;
