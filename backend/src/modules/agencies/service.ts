
import { db } from '../../infrastructure/database/index.js';
import { agencies } from '../../infrastructure/database/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { createAgencySchema, updateAgencySchema, agencySchema, CreateAgencyInput, UpdateAgencyInput, CompleteAgencySetupInput, ProvisionAgencyInput } from './schemas.js';

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
    async createAgency(input: CreateAgencyInput) {

        try {
            const validated = createAgencySchema.parse(input);
            const [agency] = await db.insert(agencies).values({
                ...validated,
                status: 'pending',
                isActive: true,
            }).returning();

            // Trigger provisioning job here via BullMQ
            if (validated.status === 'pending') {
                const { agencyProvisioningJobs, users } = await import('../../infrastructure/database/schema.js');
                const { agencyProvisioningQueue } = await import('../../jobs/queues.js');

                // If we have an owner, fetch details
                let ownerDetails = { email: validated.contactEmail || 'admin@example.com', passwordHash: '', firstName: 'Admin', lastName: 'User' };

                if (validated.ownerUserId) {
                    const [user] = await db.select().from(users).where(eq(users.id, validated.ownerUserId));
                    if (user) {
                        ownerDetails.email = user.email;
                        ownerDetails.passwordHash = user.passwordHash;
                    }
                }

                // Create Job
                const [job] = await db.insert(agencyProvisioningJobs).values({
                    domain: validated.domain,
                    databaseName: validated.databaseName,
                    agencyName: validated.name,
                    ownerEmail: ownerDetails.email,
                    subscriptionPlan: validated.subscriptionPlan || 'trial',
                    requestedBy: validated.ownerUserId,
                    agencyId: agency.id,
                    status: 'pending',
                    payload: { ...validated, password: '***' },
                }).returning();

                // Add to Queue
                await agencyProvisioningQueue.add('provision-agency', {
                    jobId: job.id,
                    agencyId: agency.id,
                    dbName: validated.databaseName,
                    subdomain: validated.domain.split('.')[0],
                    adminEmail: ownerDetails.email,
                    adminPasswordHash: ownerDetails.passwordHash,
                    adminFirstName: ownerDetails.firstName,
                    adminLastName: ownerDetails.lastName,
                    userId: validated.ownerUserId,
                    plan: validated.subscriptionPlan || 'trial',
                });

                this.logger.info({ agencyId: agency.id, jobId: job.id }, 'Agency created and provisioning queued');
            } else {
                this.logger.info({ agencyId: agency.id }, 'Agency created (no provisioning)');
            }

            return agency;
        } catch (error) {
            this.logger.error({ error, context: 'createAgency', input });
            throw new AppError('Failed to create agency');
        }
    }

    /**
     * Update an agency
     */
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

    /**
     * Complete agency setup: create DB, migrate, seed admin (ASYNC)
     */
    async completeAgencySetup(input: CompleteAgencySetupInput) {

        try {
            this.logger.info({ step: '1. Input Validation', input }, 'Starting agency setup');

            // 1. Validate Input (Strict Zod check should happen in route, but we double check basics)
            if (!input.companyName || !input.subdomain || !input.adminEmail || !input.password) {
                throw new AppError('Missing required fields for setup');
            }

            const subdomain = input.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
            const dbName = `agency_${subdomain}_db`;

            // Check if domain taken (Quick synchronous check)
            const existingAgency = await db.select().from(agencies).where(eq(agencies.databaseName, dbName)).limit(1);
            if (existingAgency.length > 0) {
                const isRetry = existingAgency[0].status === 'pending';
                if (!isRetry && input.id !== existingAgency[0].id) {
                    throw new AppError('Subdomain already taken');
                }
            }

            // 2. Create/Update Agency Record (Pending State)
            const { hashPassword } = await import('../../utils/password.js');
            const hashedPassword = await hashPassword(input.password);

            // Create user in MAIN DB first (so we have an ID)
            const { users, userRoles, profiles, agencyProvisioningJobs } = await import('../../infrastructure/database/schema.js');

            // Check/Create User
            let userId;
            const existingUser = await db.select().from(users).where(eq(users.email, input.adminEmail)).limit(1);
            if (existingUser.length > 0) {
                userId = existingUser[0].id;
            } else {
                const [newUser] = await db.insert(users).values({
                    email: input.adminEmail,
                    emailNormalized: input.adminEmail.toLowerCase(),
                    passwordHash: hashedPassword,
                    status: 'active',
                    emailConfirmed: true,
                }).returning();
                userId = newUser.id;
            }

            // Create/Update Agency
            let agencyId = input.id;

            // Handle logo and teamMembers - store in metadata for now or specific tables later
            // Handle logo and teamMembers - store in metadata for now or specific tables later
            // For now we just ensure they don't cause schema validation errors (already handled by schema update)
            if (input.logo && input.logo.startsWith('data:')) {
                try {
                    const matches = input.logo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                        const mimeType = matches[1];
                        const buffer = Buffer.from(matches[2], 'base64');
                        const key = `agencies/${subdomain}/logo-${Date.now()}.${mimeType.split('/')[1]}`;

                        const { uploadFileToS3 } = await import('../../infrastructure/s3/index.js');
                        const logoUrl = await uploadFileToS3(buffer, key, mimeType);

                        // Add to metadata
                        if (!input.metadata) input.metadata = {};
                        (input.metadata as any).logoUrl = logoUrl;
                        this.logger.info({ logoUrl }, 'Logo uploaded');
                    }
                } catch (e) {
                    this.logger.error({ error: e, context: 'Logo Upload' });
                    // Don't fail setup just for logo
                }
            }
            if (!agencyId) {
                if (existingAgency.length > 0) {
                    agencyId = existingAgency[0].id; // Retry case
                } else {
                    const [newAgency] = await db.insert(agencies).values({
                        name: input.companyName,
                        domain: `${subdomain}.oru.erp`,
                        databaseName: dbName,
                        subscriptionPlan: input.plan || 'trial',
                        status: 'pending', // IMPORTANT: Pending until job finishes
                        isActive: true,
                        contactEmail: input.adminEmail,
                        ownerUserId: userId,
                    }).returning();
                    agencyId = newAgency.id;
                }
            }

            // 3. Create Job Record
            const [job] = await db.insert(agencyProvisioningJobs).values({
                domain: `${subdomain}.oru.erp`,
                databaseName: dbName,
                agencyName: input.companyName,
                ownerEmail: input.adminEmail,
                subscriptionPlan: input.plan || 'trial',
                requestedBy: userId,
                agencyId: agencyId,
                status: 'pending',
                payload: { ...input, password: '***' }, // Don't store plain password
            }).returning();

            // 4. Add to BullMQ Queue
            const { agencyProvisioningQueue } = await import('../../jobs/queues.js');
            await agencyProvisioningQueue.add('provision-agency', {
                jobId: job.id,
                agencyId: agencyId,
                dbName: dbName,
                subdomain,
                adminEmail: input.adminEmail,
                adminPasswordHash: hashedPassword,
                adminFirstName: input.firstName || 'Admin',
                adminLastName: input.lastName || 'User',
                userId: userId,
                plan: input.plan || 'trial',
            });

            this.logger.info({ agencyId, jobId: job.id }, 'Agency setup job dispatched');

            // Return Agency (with status pending)
            return await this.getAgency(agencyId);

        } catch (error) {
            this.logger.error({ error, stack: (error as Error).stack, context: 'completeAgencySetup', input });
            throw error;
        }
    }

    /**
     * Check if a domain/subdomain is available
     */
    async checkDomainAvailability(domain: string) {
        if (!domain) throw new AppError('Domain is required');

        // Normalize subdomain
        const subdomain = domain.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const dbName = `agency_${subdomain}_db`;

        const existingAgency = await db.select().from(agencies).where(eq(agencies.databaseName, dbName)).limit(1);

        if (existingAgency.length > 0) {
            return { available: false, error: 'Domain is already taken' };
        }

        return { available: true };
    }

    /**
     * Public Registration / Provisioning
     * Handles initial agency creation via Frontend Wizard
     */
    async provisionAgency(input: ProvisionAgencyInput) {

        // Validate payload
        if (!input.agencyName || !input.domain || !input.adminEmail || !input.adminPassword) {
            throw new AppError('Missing required fields for signup');
        }

        // Subdomain extraction
        // Assuming domain is something like "subdomain.oru.erp" or just "subdomain"
        const domainParts = input.domain.toLowerCase().split('.');
        const subdomain = domainParts[0].replace(/[^a-z0-9-]/g, '');

        if (!subdomain) throw new AppError('Invalid domain format');

        // Map frontend fields to internal setup payload
        const payload: CompleteAgencySetupInput = {
            companyName: input.agencyName,
            subdomain: subdomain,
            firstName: input.adminName ? input.adminName.split(' ')[0] : 'Admin',
            lastName: input.adminName ? input.adminName.split(' ').slice(1).join(' ') : 'User',
            adminEmail: input.adminEmail,
            password: input.adminPassword,
            plan: input.subscriptionPlan || 'trial',
            maxUsers: input.companySize === '10-50' ? 50 : (input.companySize === '50-100' ? 100 : 10), // Example logic
            maxStorageGB: 10, // Default

            // Structured Fields (mapped to metadata/settings if schema supports it or just kept in optional fields)
            metadata: {
                industry: input.industry,
                primaryFocus: input.primaryFocus,
                companySize: input.companySize,
            },
            settings: {
                timezone: input.timezone,
                enableGST: input.enableGST,
            },
            address: {
                country: input.country,
            },

            // Add other fields if needed
            id: input.id // Optional if updating exist pending
        };

        return await this.completeAgencySetup(payload);
    }

    /**
     * Check if agency setup is complete
     */
    async isSetupComplete(databaseName: string) {
        if (!databaseName) return false;
        const [agency] = await db.select().from(agencies).where(eq(agencies.databaseName, databaseName));
        return agency?.status === 'active';
    }
}
