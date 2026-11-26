import { FastifyPluginAsync } from 'fastify';
import { StorageEngineService } from './storage-engine.service.js';
import { AppError, ForbiddenError } from '../../utils/errors.js';

const storageRoutes: FastifyPluginAsync = async (fastify) => {
  const storageEngine = new StorageEngineService(fastify.log);

  /**
   * Upload an asset into tenant-isolated storage
   * Supports ?context=branding|avatar|general|documents query param
   */
  fastify.post('/upload', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      throw new AppError('No file provided in request', 400, 'BAD_REQUEST');
    }

    const agencyId = (request as any).user?.agencyId || 'shared';
    const queryContext = (request.query as any)?.context;
    const formContext = (data.fields?.resource as any)?.value || (data.fields?.context as any)?.value;
    const context = queryContext || formContext || 'general';

    const buffer = await data.toBuffer();
    const proto = request.headers['x-forwarded-proto'] || request.protocol;
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const baseUrl = `${proto}://${host}`;

    const result = await storageEngine.uploadFile(
      buffer,
      data.filename,
      data.mimetype,
      agencyId,
      context,
      baseUrl
    );

    return reply.code(201).send({
      success: true,
      data: result,
    });
  });

  /**
   * Stream a stored asset publicly through the API gateway.
   * This guarantees that Traefik /api routing delivers assets reliably
   * regardless of whether S3/MinIO or local disk is active.
   */
  fastify.get('/files/*', async (request, reply) => {
    const params = request.params as any;
    const rawKey = params['*'];
    if (!rawKey) {
      return reply.code(400).send({ success: false, error: 'Storage key required' });
    }

    const file = await storageEngine.getFileStream(rawKey);
    if (!file || !file.stream) {
      return reply.code(404).send({ success: false, error: 'Asset not found' });
    }

    if (file.contentType) {
      reply.header('Content-Type', file.contentType);
    }
    if (file.contentLength) {
      reply.header('Content-Length', file.contentLength);
    }
    if (file.eTag) {
      reply.header('ETag', file.eTag);
    }
    if (file.lastModified) {
      reply.header('Last-Modified', new Date(file.lastModified).toUTCString());
    }

    // High performance caching: 24h browser cache, 7d proxy cache
    reply.header('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');

    return reply.send(file.stream);
  });

  /**
   * Generates a signed download URL (for private documents)
   */
  fastify.get('/signed-url/*', { onRequest: [fastify.authenticate] }, async (request) => {
    const params = request.params as any;
    const key = params['*'] || params.key;
    if (!key) throw new AppError('Key is required', 400, 'BAD_REQUEST');

    const url = await storageEngine.getSignedUrl(key, 3600);
    return { success: true, data: { url } };
  });

  /**
   * Deletes an asset with tenant ownership validation
   */
  fastify.delete('/*', { onRequest: [fastify.authenticate] }, async (request) => {
    const params = request.params as any;
    const key = params['*'] || params.key;
    if (!key) throw new AppError('Key is required', 400, 'BAD_REQUEST');

    const agencyId = (request as any).user?.agencyId;
    const isOwner = key.startsWith(`${agencyId}/`);
    const isSuperAdmin = (request as any).ability?.can('manage', 'all');

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenError('Insufficient permissions to delete asset');
    }

    await storageEngine.deleteFile(key);
    return { success: true, message: 'Asset deleted successfully' };
  });
};

export default storageRoutes;
