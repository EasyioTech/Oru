import { db } from '../../../infrastructure/database/index.js';
import { agencies } from '../../../infrastructure/database/schema.js';
import { eq, sql } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AppError, NotFoundError } from '../../../utils/errors.js';
import {
    CompleteAgencySetupInput,
    ProvisionAgencyInput,
    CreateAgencyInput,
    createAgencySchema,
} from '../schemas.js';
import { redisConnection } from '../../../infrastructure/redis/index.js';
import { provisionNewAgency } from '../provisioning/agency-provisioner.js';

export class AgencyProvisioningService {
    constructor(
        private logger: FastifyBaseLogger,
        private dbConnection?: NodePgDatabase<any>
    ) {}

    private get activeDb(): NodePgDatabase<any> {
        return this.dbConnection || db;
    }

    async signupPreflight() {
        const results: any = {
            postgres: { status: 'down', latency: 0 },
            redis: { status: 'down', latency: 0 },
        };

        try {
            const pgStart = Date.now();
            await this.activeDb.execute(sql`SELECT 1`);
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
            await this.activeDb.execute(sql`SELECT datname FROM pg_database LIMIT 1`);
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

            const result = await provisionNewAgency(
                this.activeDb,
                {
                    agencyName: input.companyName,
                    domain: input.domain,
                    adminEmail: input.adminEmail,
                    adminPassword: input.password,
                    adminName: `${input.firstName || 'Admin'} ${input.lastName || 'User'}`.trim(),
                    adminPhone: input.adminPhone,
                    subscriptionPlan: input.plan || 'trial',
                    maxUsers: input.maxUsers,
                    maxStorageGB: input.maxStorageGB,
                    address: input.streetAddress || input.address,
                    streetAddress: input.streetAddress,
                    city: input.city,
                    state: input.state,
                    postalCode: input.postalCode,
                    country: input.country,
                    taxId: input.taxId,
                    billingEmail: input.billingEmail,
                    existingAgencyId: input.id,
                    metadata: input.metadata,
                    settings: input.settings,
                },
                this.logger
            );

            return {
                success: true,
                jobId: null,
                agencyId: result.agencyId,
                agency: result.agency,
                message: 'Agency creation completed instantly',
            };
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
            const [job] = await this.activeDb.select().from(agencyProvisioningJobs).where(eq(agencyProvisioningJobs.id, jobId));

            if (!job) throw new NotFoundError('Provisioning job not found');

            let agency = null;
            if (job.agencyId) {
                try {
                    const [row] = await this.activeDb.select().from(agencies).where(eq(agencies.id, job.agencyId));
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
            const result = await provisionNewAgency(
                this.activeDb,
                {
                    agencyName: validated.name,
                    domain: validated.domain,
                    adminEmail: validated.contactEmail || `admin@${validated.domain || 'agency'}.oruerp.com`,
                    adminPassword: 'OruPassword123!',
                    subscriptionPlan: (validated.subscriptionPlan as any) || 'trial',
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
                },
                this.logger
            );

            return {
                agency: result.agency,
                jobId: null,
                workspaceId: result.workspaceId,
            };
        } catch (error) {
            this.logger.error({ error, context: 'createAgency', input });
            throw new AppError('Failed to create agency');
        }
    }
}
