
import { db } from '../../infrastructure/database/index.js';
import { agencies } from '../../infrastructure/database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { createAgencySchema, updateAgencySchema, agencySchema } from './schemas.js';

export class AgenciesService {
    constructor(private logger: FastifyBaseLogger) { }

    /**
     * List all agencies with pagination
     */
    async listAgencies(limit = 50, offset = 0) {
        try {
            return await db.select().from(agencies)
                .orderBy(desc(agencies.createdAt))
                .limit(limit)
                .offset(offset);
        } catch (error) {
            this.logger.error({ error, context: 'listAgencies' });
            throw new AppError('Failed to fetch agencies');
        }
    }

    /**
     * Get agency by ID
     */
    async getAgency(id: string) {
        try {
            const [agency] = await db.select().from(agencies).where(eq(agencies.id, id));
            if (!agency) throw new NotFoundError('Agency not found');
            return agency;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'getAgency', id });
            throw new AppError('Failed to fetch agency');
        }
    }

    /**
     * Create a new agency
     */
    async createAgency(input: any) {
        try {
            const validated = createAgencySchema.parse(input);
            const [agency] = await db.insert(agencies).values({
                ...validated,
                status: 'pending',
                isActive: true,
            }).returning();

            // TODO: Trigger provisioning job here via BullMQ
            this.logger.info({ agencyId: agency.id }, 'Agency created');
            return agency;
        } catch (error) {
            this.logger.error({ error, context: 'createAgency', input });
            throw new AppError('Failed to create agency');
        }
    }

    /**
     * Update an agency
     */
    async updateAgency(id: string, input: any) {
        try {
            const validated = updateAgencySchema.parse(input);
            const [agency] = await db.update(agencies)
                .set({ ...validated, updatedAt: new Date() })
                .where(eq(agencies.id, id))
                .returning();

            if (!agency) throw new NotFoundError('Agency not found');
            return agency;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'updateAgency', id, input });
            throw new AppError('Failed to update agency');
        }
    }

    /**
     * Delete an agency (Soft delete)
     */
    async deleteAgency(id: string) {
        try {
            const [agency] = await db.update(agencies)
                .set({ isActive: false, deletedAt: new Date() })
                .where(eq(agencies.id, id))
                .returning();

            if (!agency) throw new NotFoundError('Agency not found');
            return agency;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'deleteAgency', id });
            throw new AppError('Failed to delete agency');
        }
    }
}
