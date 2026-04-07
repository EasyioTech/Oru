import { db } from '../../infrastructure/database/index.js';
import { blogPosts, blogCategories } from '../../infrastructure/database/schema.js';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { createBlogPostSchema, updateBlogPostSchema } from './schemas.js';

export class BlogService {
    constructor(private logger: FastifyBaseLogger) { }

    async listPublicPosts(category?: string, limit = 10) {
        try {
            let query = db.select().from(blogPosts)
                .where(and(eq(blogPosts.isPublished, true), isNull(blogPosts.deletedAt)));
            
            if (category) {
                query = query.where(eq(blogPosts.category, category));
            }

            return await query.orderBy(desc(blogPosts.publishedAt)).limit(limit);
        } catch (error) {
            this.logger.error({ error, context: 'listPublicPosts' });
            return [];
        }
    }

    async getPostBySlug(slug: string) {
        try {
            const [post] = await db.select().from(blogPosts)
                .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)));
            
            if (!post) return null;
            return post;
        } catch (error) {
            this.logger.error({ error, context: 'getPostBySlug', slug });
            return null;
        }
    }

    async createPost(input: any) {
        try {
            const validated = createBlogPostSchema.parse(input);
            const [post] = await db.insert(blogPosts).values({
                ...validated,
                publishedAt: validated.isPublished ? new Date() : null,
            }).returning();
            return post;
        } catch (error) {
            this.logger.error({ error, context: 'createPost', input });
            throw new AppError('Failed to create blog post');
        }
    }

    async updatePost(id: string, input: any) {
        try {
            const validated = updateBlogPostSchema.parse(input);
            const [post] = await db.update(blogPosts)
                .set({ 
                    ...validated, 
                    updatedAt: new Date(),
                    publishedAt: validated.isPublished ? new Date() : undefined 
                })
                .where(eq(blogPosts.id, id))
                .returning();

            if (!post) throw new NotFoundError('Post not found');
            return post;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'updatePost', id });
            throw new AppError('Failed to update blog post');
        }
    }

    async deletePost(id: string) {
        try {
            const [post] = await db.update(blogPosts)
                .set({ deletedAt: new Date(), isPublished: false })
                .where(eq(blogPosts.id, id))
                .returning();
            if (!post) throw new NotFoundError('Post not found');
            return post;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'deletePost', id });
            throw new AppError('Failed to delete blog post');
        }
    }
}
