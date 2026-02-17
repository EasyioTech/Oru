
import { db } from '../../infrastructure/database/index.js';
import { pageCatalog, pagePricingTiers } from '../../infrastructure/database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { createPageCatalogSchema, updatePageCatalogSchema } from './schemas.js';

export class CatalogService {
    constructor(private logger: FastifyBaseLogger) { }

    async listPages(limit = 100) {
        try {
            const pages = await db.select().from(pageCatalog)
                .orderBy(pageCatalog.category, pageCatalog.displayOrder)
                .limit(limit);
            // Return empty array if no pages exist, converting base_cost to number
            return (pages || []).map(page => ({
                ...page,
                baseCost: parseFloat(page.baseCost as string) || 0
            }));
        } catch (error) {
            this.logger.error({ error, context: 'listPages' });
            // Return empty array on error to prevent dashboard from breaking
            return [];
        }
    }

    async getPageDetail(id: string) {
        try {
            const [page] = await db.select().from(pageCatalog).where(eq(pageCatalog.id, id));
            if (!page) throw new NotFoundError('Page not found');

            const pricingTiers = await db.select().from(pagePricingTiers).where(eq(pagePricingTiers.pageId, id));

            return { ...page, pricingTiers };
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'getPageDetail', id });
            throw new AppError('Failed to fetch page detail');
        }
    }

    async createPage(input: any) {
        try {
            const validated = createPageCatalogSchema.parse(input);
            const [page] = await db.insert(pageCatalog).values({
                ...validated,
            }).returning();

            return page;
        } catch (error) {
            this.logger.error({ error, context: 'createPage', input });
            throw new AppError('Failed to create catalog item');
        }
    }

    async updatePage(id: string, input: any) {
        try {
            const validated = updatePageCatalogSchema.parse(input);
            const [page] = await db.update(pageCatalog)
                .set({ ...validated, updatedAt: new Date() })
                .where(eq(pageCatalog.id, id))
                .returning();

            if (!page) throw new NotFoundError('Page not found');
            return page;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'updatePage', id, input });
            throw new AppError('Failed to update catalog item');
        }
    }

    async deletePage(id: string) {
        try {
            const [page] = await db.update(pageCatalog)
                .set({ isActive: false, deletedAt: new Date() })
                .where(eq(pageCatalog.id, id))
                .returning();

            if (!page) throw new NotFoundError('Page not found');
            return page;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'deletePage', id });
            throw new AppError('Failed to delete catalog item');
        }
    }
}
