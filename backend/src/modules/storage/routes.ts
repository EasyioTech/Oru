import { FastifyPluginAsync } from 'fastify';
import { StorageEngineService } from './storage-engine.service.js';
import { AppError, ForbiddenError } from '../../utils/errors.js';
import { db } from '../../infrastructure/database/index.js';
import { documentFolders, documents } from '../../infrastructure/database/schema.js';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { mapToSnakeCase } from '../../utils/case-transform.js';

const storageRoutes: FastifyPluginAsync = async (fastify) => {
  const storageEngine = new StorageEngineService(fastify.log);

  const handleUpload = async (request: any, reply: any) => {
    const data = await request.file();
    if (!data) {
      throw new AppError('No file provided in request', 400, 'BAD_REQUEST');
    }

    const agencyId = (request as any).user?.agencyId || 'shared';
    const queryContext = (request.query as any)?.context;
    const formContext = (data.fields?.resource as any)?.value || (data.fields?.context as any)?.value || (data.fields?.bucket as any)?.value;
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
  };

  const handleStream = async (request: any, reply: any) => {
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
  };

  /**
   * Primary and alias upload endpoints
   */
  fastify.post('/upload', { onRequest: [fastify.authenticate] }, handleUpload);
  fastify.post('/files/upload', { onRequest: [fastify.authenticate] }, handleUpload);

  /**
   * Primary file streaming CDN proxy route
   */
  fastify.get('/files/*', handleStream);

  /**
   * Document Folders Management
   */
  fastify.get('/folders', { onRequest: [fastify.authenticate] }, async (request) => {
    const agencyId = (request as any).user?.agencyId;
    if (!agencyId) return { success: true, data: [] };
    const rows = await db
      .select()
      .from(documentFolders)
      .where(eq(documentFolders.agencyId, agencyId))
      .orderBy(documentFolders.name);
    return { success: true, data: rows.map(mapToSnakeCase) };
  });

  fastify.post('/folders', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const agencyId = user?.agencyId;
    const body = (request.body as any) || {};
    if (!agencyId) throw new AppError('Agency ID is required', 400, 'BAD_REQUEST');
    if (!body?.name?.trim()) throw new AppError('Folder name is required', 400, 'BAD_REQUEST');

    const [created] = await db
      .insert(documentFolders)
      .values({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        parentFolderId: body.parent_folder_id || body.parentFolderId || null,
        createdBy: user.id,
        agencyId,
      })
      .returning();
    return reply.code(201).send({ success: true, data: mapToSnakeCase(created) });
  });

  fastify.delete('/folders/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const agencyId = (request as any).user?.agencyId;
    const { id } = request.params as any;
    if (!agencyId || !id) throw new AppError('ID and Agency are required', 400, 'BAD_REQUEST');

    await db
      .delete(documentFolders)
      .where(and(eq(documentFolders.id, id), eq(documentFolders.agencyId, agencyId)));
    return { success: true, message: 'Folder deleted successfully' };
  });

  /**
   * Documents Management
   */
  fastify.get('/documents', { onRequest: [fastify.authenticate] }, async (request) => {
    const agencyId = (request as any).user?.agencyId;
    if (!agencyId) return { success: true, data: [] };
    const { folder } = (request.query as any) || {};
    const conditions = [eq(documents.agencyId, agencyId)];
    if (folder) {
      conditions.push(eq(documents.folderId, folder));
    } else {
      conditions.push(isNull(documents.folderId));
    }

    const rows = await db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));
    return { success: true, data: rows.map(mapToSnakeCase) };
  });

  fastify.post('/documents', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = (request as any).user;
    const agencyId = user?.agencyId;
    const body = (request.body as any) || {};
    if (!agencyId) throw new AppError('Agency ID is required', 400, 'BAD_REQUEST');
    if (!body?.name || !body?.file_path) {
      throw new AppError('Document name and file_path are required', 400, 'BAD_REQUEST');
    }

    const [created] = await db
      .insert(documents)
      .values({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        filePath: body.file_path,
        fileSize: Number(body.file_size || 0),
        fileType: body.file_type || 'application/octet-stream',
        uploadedBy: user.id,
        folderId: body.folder_id || body.folderId || null,
        agencyId,
        isPublic: Boolean(body.is_public ?? body.isPublic ?? false),
        tags: Array.isArray(body.tags) ? body.tags : [],
      })
      .returning();
    return reply.code(201).send({ success: true, data: mapToSnakeCase(created) });
  });

  fastify.patch('/documents/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const agencyId = (request as any).user?.agencyId;
    const { id } = request.params as any;
    const body = (request.body as any) || {};
    if (!agencyId || !id) throw new AppError('ID and Agency are required', 400, 'BAD_REQUEST');

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description ? body.description.trim() : null;
    if (body.is_public !== undefined || body.isPublic !== undefined) {
      updateData.isPublic = Boolean(body.is_public ?? body.isPublic);
    }
    if (body.folder_id !== undefined || body.folderId !== undefined) {
      updateData.folderId = body.folder_id ?? body.folderId ?? null;
    }
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags : [];
    }

    const [updated] = await db
      .update(documents)
      .set(updateData)
      .where(and(eq(documents.id, id), eq(documents.agencyId, agencyId)))
      .returning();

    if (!updated) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    return { success: true, data: mapToSnakeCase(updated) };
  });

  fastify.delete('/documents/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const agencyId = (request as any).user?.agencyId;
    const { id } = request.params as any;
    if (!agencyId || !id) throw new AppError('ID and Agency are required', 400, 'BAD_REQUEST');

    await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.agencyId, agencyId)));
    return { success: true, message: 'Document deleted successfully' };
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
