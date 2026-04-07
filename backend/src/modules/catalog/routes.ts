
import { FastifyPluginAsync } from 'fastify';
import { CatalogService } from './service.js';
import { listPageCatalogResponseSchema, pageDetailResponseSchema, pageCatalogResponseSchema } from './schemas.js';
import { ForbiddenError } from '../../utils/errors.js';

const catalogRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new CatalogService(fastify.log);

    // GET /public (Public SEO Access)
    fastify.get('/public', async (request, reply) => {
        try {
            const items = await service.listPublicPages();
            return { success: true, data: items };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ success: false, message: 'Internal Server Error' });
        }
    });

    fastify.get('/public/:slug', async (request, reply) => {
        try {
            const { slug } = request.params as { slug: string };
            const item = await service.getPublicPageByPath(slug);
            if (!item) return reply.code(404).send({ success: false, message: 'Feature not found' });
            return { success: true, data: item };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ success: false, message: 'Internal Server Error' });
        }
    });

    // List Catalog
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'Catalog')) {
                throw new ForbiddenError('Insufficient permissions to view catalog');
            }

            const items = await service.listPages();
            const response = listPageCatalogResponseSchema.parse({ items });
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Get Page Detail
    fastify.get('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('read', 'Catalog')) {
                throw new ForbiddenError();
            }

            const detail = await service.getPageDetail(id);
            const response = pageDetailResponseSchema.parse(detail);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Create Catalog Entry
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'Catalog')) {
                throw new ForbiddenError();
            }

            const rawPage = await service.createPage(request.body);
            const response = pageCatalogResponseSchema.parse(rawPage);
            return reply.code(201).send({ success: true, data: response });
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Update Catalog Entry
    fastify.put('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('update', 'Catalog')) {
                throw new ForbiddenError();
            }

            const rawPage = await service.updatePage(id, request.body);
            const response = pageCatalogResponseSchema.parse(rawPage);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Delete Catalog Entry
    fastify.delete('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('delete', 'Catalog')) {
                throw new ForbiddenError();
            }

            await service.deletePage(id);
            return { success: true, message: 'Page deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
};

export default catalogRoutes;
