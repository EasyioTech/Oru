import { db } from '../../infrastructure/database/index.js';
import { agencies } from '../../infrastructure/database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { updateAgencySchema, UpdateAgencyInput } from './schemas.js';

export class AgenciesService {
    constructor(private logger: FastifyBaseLogger) {}

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

    async updateAgency(id: string, input: UpdateAgencyInput) {
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

    async checkDomainAvailability(domain: string) {
        if (!domain) throw new AppError('Domain is required');
        const agencyDomain = domain.toLowerCase().trim();
        const existing = await db.select().from(agencies).where(eq(agencies.domain, agencyDomain)).limit(1);
        return existing.length > 0 ? { available: false, error: 'Domain is already taken' } : { available: true };
    }

    async isSetupComplete(domain: string) {
        if (!domain) return false;
        const [agency] = await db.select().from(agencies).where(eq(agencies.domain, domain));
        return agency?.status === 'active';
    }
}
