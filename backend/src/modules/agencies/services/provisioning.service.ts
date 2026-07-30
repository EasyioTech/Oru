import { db } from '../../../infrastructure/database/index.js';
import { agencies } from '../../../infrastructure/database/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AppError, NotFoundError } from '../../../utils/errors.js';
import { CompleteAgencySetupInput, ProvisionAgencyInput, CreateAgencyInput, createAgencySchema } from '../schemas.js';
import { redisConnection } from '../../../infrastructure/redis/index.js';
import { WorkspaceProfileService } from '../../core/services/workspace-profile.service.js';

export class AgencyProvisioningService {
    private workspaceProfileService: WorkspaceProfileService;

    constructor(
        private logger: FastifyBaseLogger,
        private dbConnection?: NodePgDatabase<any>
    ) {
        this.workspaceProfileService = new WorkspaceProfileService(
            dbConnection || db,
            logger
        );
    }

    async signupPreflight() {
        const results: any = {
            postgres: { status: 'down', latency: 0 },
            redis: { status: 'down', latency: 0 },
        };

        try {
            const pgStart = Date.now();
            await db.execute(sql`SELECT 1`);
            results.postgres.status = 'up';
            results.postgres.latency = Date.now() - pgStart;
        } catch (error) {
            this.logger.error({ error, context: 'preflight-postgres' });
        }

        try {
            const redisStart = Date.now();
            await redisConnection.ping();
            results.redis.status = 'up';
            results.redis.latency = Date.now() - redisStart;
        } catch (error) {
            this.logger.error({ error, context: 'preflight-redis' });
        }

        if (results.postgres.status !== 'up') {
            return {
                allowed: false,
                reason: 'DATABASE_UNREACHABLE',
                message: 'The central database is currently unreachable. Please try again later.'
            };
        }

        try {
            await db.execute(sql`SELECT datname FROM pg_database LIMIT 1`);
        } catch (error: any) {
            this.logger.error({ error, context: 'preflight-permission' });
            return {
                allowed: false,
                reason: 'INSUFFICIENT_PERMISSIONS',
                message: 'Database provisioning permissions are not correctly configured.'
            };
        }

        return {
            allowed: true,
            status: results.redis.status === 'up' ? 'healthy' : 'degraded',
            postgresLatency: results.postgres.latency,
            timestamp: new Date().toISOString()
        };
    }

    async completeAgencySetup(input: CompleteAgencySetupInput) {
        try {
            if (!input.companyName || !input.domain || !input.adminEmail || !input.password) {
                throw new AppError('Missing required fields for setup');
            }

            const agencyDomain = input.domain.toLowerCase().trim();

            const existingAgency = await db.select().from(agencies).where(eq(agencies.domain, agencyDomain)).limit(1);
            if (existingAgency.length > 0) {
                const isRetry = existingAgency[0].status === 'pending';
                if (!isRetry && input.id !== existingAgency[0].id) {
                    throw new AppError('Subdomain already taken');
                }
            }

            const { hashPassword } = await import('../../../utils/password.js');
            const hashedPassword = await hashPassword(input.password);
            const { users, userRoles, profiles } = await import('../../../infrastructure/database/schema.js');

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

            let agencyId = input.id;
            if (!agencyId) {
                if (existingAgency.length > 0) {
                    agencyId = existingAgency[0].id;
                } else {
                    const [newAgency] = await db.insert(agencies).values({
                        name: input.companyName,
                        domain: agencyDomain,
                        subscriptionPlan: input.plan || 'trial',
                        status: 'active',
                        isActive: true,
                        contactEmail: input.adminEmail,
                        contactPhone: input.adminPhone,
                        billingEmail: input.billingEmail || input.adminEmail,
                        address: input.streetAddress || input.address,
                        city: input.city,
                        state: input.state,
                        postalCode: input.postalCode,
                        country: input.country,
                        taxId: input.taxId,
                        ownerUserId: userId,
                        settings: input.settings || {},
                        metadata: {
                            ...(input.metadata || {}),
                            industry: (input.metadata as any)?.industry,
                            companySize: (input.metadata as any)?.companySize,
                            primaryFocus: (input.metadata as any)?.primaryFocus,
                        }
                    }).returning();
                    agencyId = newAgency.id;
                }
            }

            const [existingRole] = await db.select().from(userRoles).where(
                and(
                    eq(userRoles.userId, userId),
                    eq(userRoles.agencyId, agencyId),
                    eq(userRoles.role, 'agency_admin')
                )
            ).limit(1);

            if (!existingRole) {
                await db.insert(userRoles).values({
                    userId,
                    agencyId,
                    role: 'agency_admin',
                    permissions: ['*'],
                });
            } else {
                await db.update(userRoles)
                    .set({ permissions: ['*'] })
                    .where(eq(userRoles.id, existingRole.id));
            }

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

            this.logger.info({ agencyId }, 'Agency created and activated instantly');
            return { success: true, jobId: null, agencyId, message: 'Agency creation completed instantly' };

        } catch (error: any) {
            this.logger.error({ error, context: 'completeAgencySetup' });
            throw error;
        }
    }

    async provisionAgency(input: ProvisionAgencyInput) {
        if (!input.agencyName || !input.domain || !input.adminEmail || !input.adminPassword) {
            throw new AppError('Missing required fields for signup');
        }

        const domain = input.domain.toLowerCase().trim();
        if (!domain) throw new AppError('Invalid domain format');

        return await this.completeAgencySetup({
            companyName: input.agencyName,
            domain,
            firstName: input.adminName ? input.adminName.split(' ')[0] : 'Admin',
            lastName: input.adminName ? input.adminName.split(' ').slice(1).join(' ') : 'User',
            adminEmail: input.adminEmail,
            adminPhone: input.adminPhone,
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
            streetAddress: input.streetAddress,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
            billingEmail: input.billingEmail,
            taxId: input.taxId,
            id: input.id,
        });
    }

    async getProvisioningStatus(jobId: string) {
        try {
            const { agencyProvisioningJobs } = await import('../../../infrastructure/database/schema.js');
            const [job] = await db.select().from(agencyProvisioningJobs).where(eq(agencyProvisioningJobs.id, jobId));

            if (!job) throw new NotFoundError('Provisioning job not found');

            let agency = null;
            if (job.agencyId) {
                try {
                    const [row] = await db.select().from(agencies).where(eq(agencies.id, job.agencyId));
                    agency = row || null;
                } catch (e) {
                    this.logger.warn({ agencyId: job.agencyId }, 'Agency not found for provisioning job');
                }
            }

            return {
                status: job.status,
                progress: job.progressPercentage,
                error: job.errorMessage,
                result: job.result,
                agency,
                step: job.currentStep,
            };
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error({ error, context: 'getProvisioningStatus', jobId });
            throw new AppError('Failed to fetch provisioning status');
        }
    }

    async createAgency(input: CreateAgencyInput) {
        try {
            const validated = createAgencySchema.parse(input);
            const [agency] = await db.insert(agencies).values({
                ...validated,
                status: 'pending',
                isActive: true,
            }).returning();

            const workspaceId = `workspace-${agency.id}-${Date.now()}`;
            await this.workspaceProfileService.createDefaultWorkspace(
                workspaceId,
                agency.id
            );

            const result = await this.completeAgencySetup({
                companyName: agency.name,
                domain: agency.domain,
                adminEmail: agency.contactEmail || 'admin@example.com',
                password: 'OruPassword123!',
                plan: agency.subscriptionPlan as any,
                id: agency.id,
            });

            this.logger.info(
                { agencyId: agency.id, workspaceId },
                'Agency created with default workspace provisioned'
            );

            return { agency, jobId: result.jobId, workspaceId };
        } catch (error) {
            this.logger.error({ error, context: 'createAgency', input });
            throw new AppError('Failed to create agency');
        }
    }
}
