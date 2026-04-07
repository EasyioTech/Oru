import { FastifyPluginAsync } from 'fastify';
import { BlogService } from './service.js';
import { blogPostResponseSchema, listBlogPostsResponseSchema } from './schemas.js';
import { ForbiddenError } from '../../utils/errors.js';

const blogRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new BlogService(fastify.log);

    // GET /public (Public SEO Access)
    fastify.get('/public', async (request) => {
        const query = request.query as { category?: string; limit?: string };
        const posts = await service.listPublicPosts(query.category, parseInt(query.limit || '10'));
        return { success: true, data: posts };
    });

    // GET /public/:slug (Public Detail)
    fastify.get('/public/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const post = await service.getPostBySlug(slug);
        if (!post) return reply.code(404).send({ success: false, message: 'Article not found' });
        return { success: true, data: post };
    });

    // Admin Routes
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('read', 'System')) throw new ForbiddenError();
        const posts = await service.listPublicPosts(); // Reuse for now, listAdminPosts later
        return { success: true, data: posts };
    });

    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (!request.ability.can('create', 'System')) throw new ForbiddenError();
        const post = await service.createPost(request.body);
        return reply.code(201).send({ success: true, data: post });
    });

    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('update', 'System')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        const post = await service.updatePost(id, request.body);
        return { success: true, data: post };
    });

    fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (!request.ability.can('delete', 'System')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await service.deletePost(id);
        return { success: true, message: 'Article deleted' };
    });
};

export default blogRoutes;
