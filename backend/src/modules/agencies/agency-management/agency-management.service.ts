import { db } from '../../../infrastructure/database/index.js';
import { agencies } from '../../../infrastructure/database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../../utils/errors.js';
import { UpdateAgencyInput, updateAgencySchema } from '../schemas.js';
import { transformAgencyRow } from '../../../infrastructure/transformers/agency.transformer.js';
import { sanitizeDomainSlug } from '../tenant-provisioning/domain-slug-resolver.js';

/**
 * Service managing agency CRUD, lifecycle, and domain verification.
 */
export class AgencyManagementService {
  constructor(private logger: FastifyBaseLogger) {}

  async listAgencies(limit = 50, offset = 0) {
    try {
      const results = await db
        .select()
        .from(agencies)
        .orderBy(desc(agencies.createdAt))
        .limit(limit)
        .offset(offset);
      return results.map(transformAgencyRow);
    } catch (error) {
      this.logger.error({ error, context: 'listAgencies' });
      throw new AppError('Failed to fetch agencies');
    }
  }

  async getAgency(id: string) {
    try {
      const [agency] = await db
        .select()
        .from(agencies)
        .where(eq(agencies.id, id));
      if (!agency) throw new NotFoundError('Agency not found');
      return transformAgencyRow(agency);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error({ error, context: 'getAgency', id });
      throw new AppError('Failed to fetch agency');
    }
  }

  async updateAgency(id: string, input: UpdateAgencyInput) {
    try {
      const validated = updateAgencySchema.parse(input);
      const [agency] = await db
        .update(agencies)
        .set({ ...validated, updatedAt: new Date() })
        .where(eq(agencies.id, id))
        .returning();
      if (!agency) throw new NotFoundError('Agency not found');
      return transformAgencyRow(agency);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error({ error, context: 'updateAgency', id, input });
      throw new AppError('Failed to update agency');
    }
  }

  async deleteAgency(id: string) {
    try {
      const [agency] = await db
        .update(agencies)
        .set({ isActive: false, deletedAt: new Date() })
        .where(eq(agencies.id, id))
        .returning();
      if (!agency) throw new NotFoundError('Agency not found');
      return transformAgencyRow(agency);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error({ error, context: 'deleteAgency', id });
      throw new AppError('Failed to delete agency');
    }
  }

  async checkDomainAvailability(domain: string) {
    if (!domain) throw new AppError('Domain is required');
    const agencyDomain = sanitizeDomainSlug(domain);
    const existing = await db
      .select({ id: agencies.id })
      .from(agencies)
      .where(eq(agencies.domain, agencyDomain))
      .limit(1);

    return existing.length > 0
      ? { available: false, error: 'Domain is already taken' }
      : { available: true, normalizedDomain: agencyDomain };
  }

  async isSetupComplete(domain: string) {
    if (!domain) return false;
    const sanitized = sanitizeDomainSlug(domain);
    const [agency] = await db
      .select({ status: agencies.status })
      .from(agencies)
      .where(eq(agencies.domain, sanitized));
    return agency?.status === 'active';
  }
}
