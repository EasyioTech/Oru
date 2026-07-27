import { FastifyPluginAsync } from 'fastify';
import { AppError, ForbiddenError } from '../../utils/errors.js';
import crypto from 'crypto';

const storageRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/upload', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const data = await request.file();
        if (!data) {
            throw new AppError('No file provided', 400, 'BAD_REQUEST');
        }

        const agencyId = request.user.agencyId;
        const ext = data.filename.split('.').pop() || 'bin';
        const uuid = crypto.randomUUID();
        const resource = (data.fields?.resource as any)?.value || 'uploads';
        const key = `${agencyId}/${resource}/${uuid}.${ext}`;

        const buffer = await data.toBuffer();
        const url = await fastify.storage.upload(key, buffer, data.mimetype);

        return { success: true, data: { key, url } };
    });

    fastify.get('/signed-url/*', { onRequest: [fastify.authenticate] }, async (request) => {
        const params = request.params as any;
        const key = params['*'] || params.key;
        if (!key) throw new AppError('Key is required', 400, 'BAD_REQUEST');

        const url = await fastify.storage.signedUrl(key, 3600);
        return { success: true, data: { url } };
    });

    fastify.delete('/*', { onRequest: [fastify.authenticate] }, async (request) => {
        const params = request.params as any;
        const key = params['*'] || params.key;
        if (!key) throw new AppError('Key is required', 400, 'BAD_REQUEST');
        
        const agencyId = request.user.agencyId;
        
        const isOwner = key.startsWith(`${agencyId}/`);
        const isSuperAdmin = request.ability.can('manage', 'all');

        if (!isOwner && !isSuperAdmin) {
            throw new ForbiddenError();
        }

        await fastify.storage.delete(key);
        return { success: true };
    });
};

export default storageRoutes;
