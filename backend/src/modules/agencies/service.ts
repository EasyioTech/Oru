
import { db } from '../../infrastructure/database/index.js';
import { agencies } from '../../infrastructure/database/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { createAgencySchema, updateAgencySchema, CreateAgencyInput, UpdateAgencyInput, CompleteAgencySetupInput, ProvisionAgencyInput } from './schemas.js';

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
     * Create a new agency (Super Admin / Internal)
     */
    async createAgency(input: CreateAgencyInput) {
        try {
            const validated = createAgencySchema.parse(input);
            const [agency] = await db.insert(agencies).values({
                ...validated,
                status: 'pending',
                isActive: true,
            }).returning();

            // We use the same completeAgencySetup logic but adapted for internal use
            const { hashPassword } = await import('../../utils/password.js');
            const defaultPassword = 'OruPassword123!';
            const hashedPassword = await hashPassword(defaultPassword);

            const result = await this.completeAgencySetup({
                companyName: agency.name,
                subdomain: agency.databaseName.replace('agency_', '').replace('_db', ''),
                adminEmail: agency.contactEmail || 'admin@example.com',
                password: defaultPassword,
                plan: agency.subscriptionPlan as any,
                id: agency.id
            });

            return { agency, jobId: result.jobId };
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
            this.logger.info({ step: '1. Input Validation', subdomain: input.subdomain }, 'Starting agency setup');

            if (!input.companyName || !input.subdomain || !input.adminEmail || !input.password) {
                throw new AppError('Missing required fields for setup');
            }

            const subdomain = input.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
            const dbName = `agency_${subdomain}_db`;

            // Check if subdomain taken
            const existingAgency = await db.select().from(agencies).where(eq(agencies.databaseName, dbName)).limit(1);
            if (existingAgency.length > 0) {
                const isRetry = existingAgency[0].status === 'pending';
                if (!isRetry && input.id !== existingAgency[0].id) {
                    throw new AppError('Subdomain already taken');
                }
            }

            const { hashPassword } = await import('../../utils/password.js');
            const hashedPassword = await hashPassword(input.password);

            const { users, userRoles, agencyProvisioningJobs, profiles } = await import('../../infrastructure/database/schema.js');

            // 1. Check/Create User in Main DB
            let userId;
            const [existingUser] = await db.select().from(users).where(eq(users.email, input.adminEmail)).limit(1);
            if (existingUser) {
                userId = existingUser.id;
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



            // 3. Create or Update Agency Record
            let agencyId = input.id;
            if (!agencyId) {
                if (existingAgency.length > 0) {
                    agencyId = existingAgency[0].id;
                } else {
                    const [newAgency] = await db.insert(agencies).values({
                        name: input.companyName,
                        domain: `${subdomain}.oru.erp`,
                        databaseName: dbName,
                        subscriptionPlan: input.plan || 'trial',
                        status: 'pending',
                        isActive: true,
                        contactEmail: input.adminEmail,
                        ownerUserId: userId,
                    }).returning();
                    agencyId = newAgency.id;
                }
            }

            // 4. Assign Role
            const [existingRole] = await db.select().from(userRoles).where(
                and(
                    eq(userRoles.userId, userId),
                    eq(userRoles.agencyId, agencyId),
                    eq(userRoles.role, 'agency_admin')
                )
            ).limit(1);

            if (!existingRole) {
                await db.insert(userRoles).values({
                    userId: userId,
                    agencyId: agencyId,
                    role: 'agency_admin',
                    permissions: ['*'],
                });
            } else {
                await db.update(userRoles)
                    .set({ permissions: ['*'] })
                    .where(eq(userRoles.id, existingRole.id));
            }

            // 5. Create/Update Profile
            const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
            if (existingProfile) {
                await db.update(profiles).set({ agencyId, updatedAt: new Date() }).where(eq(profiles.userId, userId));
            } else {
                await db.insert(profiles).values({
                    userId,
                    agencyId,
                    fullName: `${input.firstName || 'Admin'} ${input.lastName || 'User'}`,
                });
            }

            // 4. Create Job Record
            const [jobRecord] = await db.insert(agencyProvisioningJobs).values({
                domain: `${subdomain}.oru.erp`,
                databaseName: dbName,
                agencyName: input.companyName,
                ownerEmail: input.adminEmail,
                subscriptionPlan: input.plan || 'trial',
                requestedBy: userId,
                agencyId: agencyId,
                status: 'pending',
                payload: { ...input, password: '***' },
            }).returning();

            // 5. QUEUE THE JOB (CRITICAL FIX)
            const { agencyProvisioningQueue } = await import('../../jobs/queues.js');
            await agencyProvisioningQueue.add('provision-agency', {
                jobId: jobRecord.id,
                agencyId: agencyId,
                dbName: dbName,
                subdomain: subdomain,
                adminEmail: input.adminEmail,
                adminPasswordHash: hashedPassword,
                userId: userId,
            });

            this.logger.info({ jobId: jobRecord.id, agencyId }, 'Agency provisioning job queued successfully');

            return {
                success: true,
                jobId: jobRecord.id,
                agencyId: agencyId,
                message: 'Agency creation started'
            };

        } catch (error: any) {
            this.logger.error({ error, context: 'completeAgencySetup' });
            throw error;
        }
    }

    /**
     * Get provisioning job status
     */
    async getProvisioningStatus(jobId: string) {
        try {
            const { agencyProvisioningJobs } = await import('../../infrastructure/database/schema.js');
            const [job] = await db.select().from(agencyProvisioningJobs).where(eq(agencyProvisioningJobs.id, jobId));

            if (!job) throw new NotFoundError('Provisioning job not found');

            let agency = null;
            if (job.agencyId) {
                try {
                    agency = await this.getAgency(job.agencyId);
                } catch (e) {
                    this.logger.warn({ agencyId: job.agencyId }, 'Agency not found for provisioning job');
                }
            }

            return {
                status: job.status,
                progress: job.progressPercentage,
                error: job.errorMessage,
                result: job.result,
                agency: agency,
                step: job.currentStep
            };
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'getProvisioningStatus', jobId });
            throw new AppError('Failed to fetch provisioning status');
        }
    }

    /**
     * Check if a domain/subdomain is available
     */
    async checkDomainAvailability(domain: string) {
        if (!domain) throw new AppError('Domain is required');
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
     */
    async provisionAgency(input: ProvisionAgencyInput) {
        if (!input.agencyName || !input.domain || !input.adminEmail || !input.adminPassword) {
            throw new AppError('Missing required fields for signup');
        }

        const subdomain = input.domain.toLowerCase().split('.')[0].replace(/[^a-z0-9-]/g, '');
        if (!subdomain) throw new AppError('Invalid domain format');

        const payload: CompleteAgencySetupInput = {
            companyName: input.agencyName,
            subdomain: subdomain,
            firstName: input.adminName ? input.adminName.split(' ')[0] : 'Admin',
            lastName: input.adminName ? input.adminName.split(' ').slice(1).join(' ') : 'User',
            adminEmail: input.adminEmail,
            password: input.adminPassword,
            plan: input.subscriptionPlan || 'trial',
            maxUsers: input.companySize === '10-50' ? 50 : (input.companySize === '50-100' ? 100 : 10),
            maxStorageGB: 10,
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
            id: input.id
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
