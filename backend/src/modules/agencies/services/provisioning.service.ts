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
            const { users, userRoles, profiles, agencySettings, workspaceProfiles } = await import('../../../infrastructure/database/schema.js');

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
            let agencyRow: any = null;
            if (agencyId) {
                const [updated] = await db.update(agencies).set({
                    status: 'active',
                    isActive: true,
                    ownerUserId: userId,
                    contactEmail: input.adminEmail,
                    contactPhone: input.adminPhone || undefined,
                    billingEmail: input.billingEmail || input.adminEmail,
                    address: input.streetAddress || input.address || undefined,
                    city: input.city || undefined,
                    state: input.state || undefined,
                    postalCode: input.postalCode || undefined,
                    country: input.country || 'India',
                    taxId: input.taxId || undefined,
                    updatedAt: new Date(),
                }).where(eq(agencies.id, agencyId)).returning();
                agencyRow = updated;
            } else if (existingAgency.length > 0) {
                agencyId = existingAgency[0].id;
                const [updated] = await db.update(agencies).set({
                    status: 'active',
                    isActive: true,
                    ownerUserId: userId,
                    contactEmail: input.adminEmail,
                    contactPhone: input.adminPhone || undefined,
                    billingEmail: input.billingEmail || input.adminEmail,
                    address: input.streetAddress || input.address || undefined,
                    city: input.city || undefined,
                    state: input.state || undefined,
                    postalCode: input.postalCode || undefined,
                    country: input.country || 'India',
                    taxId: input.taxId || undefined,
                    updatedAt: new Date(),
                }).where(eq(agencies.id, agencyId)).returning();
                agencyRow = updated;
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
                    country: input.country || 'India',
                    taxId: input.taxId,
                    ownerUserId: userId,
                    settings: input.settings || { currency: 'INR', locale: 'en-IN' },
                    metadata: {
                        ...(input.metadata || {}),
                        industry: (input.metadata as any)?.industry,
                        companySize: (input.metadata as any)?.companySize,
                        primaryFocus: (input.metadata as any)?.primaryFocus,
                        provisionedAt: new Date().toISOString(),
                    }
                }).returning();
                agencyId = newAgency.id;
                agencyRow = newAgency;
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
                    isActive: true,
                });
            } else {
                await db.update(userRoles)
                    .set({ permissions: ['*'], isActive: true })
                    .where(eq(userRoles.id, existingRole.id));
            }

            const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
            if (existingProfile) {
                await db.update(profiles).set({ agencyId, updatedAt: new Date() }).where(eq(profiles.userId, userId));
            } else {
                await db.insert(profiles).values({
                    userId,
                    agencyId,
                    fullName: `${input.firstName || 'Admin'} ${input.lastName || 'User'}`.trim(),
                });
            }

            // Seed default agency settings if not exists (Indian ERP standards)
            try {
                const [existingSettings] = await db.select().from(agencySettings).where(eq(agencySettings.agencyId, agencyId)).limit(1);
                if (!existingSettings) {
                    await db.insert(agencySettings).values({
                        agencyId,
                        agencyName: input.companyName,
                        domain: agencyDomain,
                        timezone: 'Asia/Kolkata',
                        dateFormat: 'DD/MM/YYYY',
                        fiscalYearStart: '04-01',
                        workingHoursStart: '09:30',
                        workingHoursEnd: '18:30',
                        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
                        primaryColor: '#0a6ed1',
                        secondaryColor: '#0854a0',
                    });
                }
            } catch (err: any) {
                this.logger.warn({ error: err.message, agencyId }, 'Agency settings seeding skipped or table unavailable');
            }

            // Seed default workspace profile using agencyId as workspace_id UUID (all starter modules enabled)
            try {
                const [existingWorkspace] = await db.select().from(workspaceProfiles).where(eq(workspaceProfiles.workspace_id, agencyId)).limit(1);
                if (!existingWorkspace) {
                    const starterList = [
                        { name: 'core', enabled: true },
                        { name: 'dashboard', enabled: true },
                        { name: 'crm', enabled: true },
                        { name: 'projects', enabled: true },
                        { name: 'finance', enabled: true },
                        { name: 'hr', enabled: true },
                        { name: 'inventory', enabled: true },
                        { name: 'procurement', enabled: true },
                        { name: 'reports', enabled: true },
                    ];
                    await db.insert(workspaceProfiles).values({
                        workspace_id: agencyId,
                        modules_json: {
                            active: starterList,
                            available: starterList,
                            disabled: [],
                            core: { enabled: true },
                            dashboard: { enabled: true },
                            crm: { enabled: true },
                            projects: { enabled: true },
                            finance: { enabled: true },
                            hr: { enabled: true },
                            inventory: { enabled: true },
                            procurement: { enabled: true },
                            reports: { enabled: true },
                        },
                        collaboration_json: { members_count: 1, solo: false, email_verified: true },
                        adoption_json: { features_used: [], days_active: 1, last_action: new Date().toISOString() },
                        health_json: { score: 100, last_updated: new Date().toISOString() },
                        recommendations_json: [],
                        quick_wins_json: [],
                    });
                }
            } catch (err: any) {
                this.logger.warn({ error: err.message, agencyId }, 'Workspace profile seeding skipped or table unavailable');
            }

            this.logger.info({ agencyId }, 'Agency created and activated instantly with settings and workspace');
            return { success: true, jobId: null, agencyId, agency: agencyRow, message: 'Agency creation completed instantly' };

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
            const domain = (validated.domain || validated.name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `agency-${Date.now().toString(36)}`;

            const result = await this.completeAgencySetup({
                companyName: validated.name,
                domain,
                adminEmail: validated.contactEmail || `admin@${domain}.oruerp.com`,
                password: 'OruPassword123!',
                plan: (validated.subscriptionPlan as any) || 'trial',
                maxUsers: validated.maxUsers || 50,
                maxStorageGB: validated.maxStorageGB || 10,
                address: validated.address || undefined,
                city: validated.city || undefined,
                state: validated.state || undefined,
                postalCode: validated.postalCode || undefined,
                country: validated.country || 'India',
                taxId: validated.taxId || undefined,
                settings: (validated.settings as any) || undefined,
                metadata: (validated.metadata as any) || undefined,
            });

            const [agency] = await db.select().from(agencies).where(eq(agencies.id, result.agencyId)).limit(1);

            this.logger.info(
                { agencyId: result.agencyId },
                'Agency created and fully provisioned with settings and workspace'
            );

            return { agency, jobId: null, workspaceId: result.agencyId };
        } catch (error) {
            this.logger.error({ error, context: 'createAgency', input });
            throw new AppError('Failed to create agency');
        }
    }
}
