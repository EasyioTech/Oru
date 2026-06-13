
import { FastifyPluginAsync } from 'fastify';
import { AgenciesService } from './service.js';
import { listAgenciesResponseSchema, agencyResponseSchema, createAgencySchema, updateAgencySchema, completeAgencySetupSchema, provisionAgencySchema } from './schemas.js';
import { ForbiddenError } from '../../utils/errors.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';
import { db } from '../../infrastructure/database/index.js';
import { agencies, profiles, projects, clients, users } from '../../infrastructure/database/schema.js';
import { eq, and, count, isNull, gte } from 'drizzle-orm';

const agencyRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new AgenciesService(fastify.log);

    // --- Public Routes ---

    // Check Domain Availability (Public)
    // MUST BE BEFORE /:id because "check-domain" matches :id pattern
    fastify.get('/check-domain', async (request, reply) => {
        try {
            const domain = (request.query as { domain: string }).domain;
            const result = await service.checkDomainAvailability(domain);
            return result;
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // --- Protected Routes ---

    // Agency Admin Dashboard Metrics
    // MUST BE BEFORE /:id to avoid route collision
    fastify.get('/me/dashboard', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const agencyId = (request as any).user?.agencyId;
        if (!agencyId) {
            return reply.status(400).send({ success: false, error: 'No agency context in token' });
        }

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        try {
            const [
                agencyRows,
                totalUsersResult,
                activeUsersResult,
                totalProjectsResult,
                activeProjectsResult,
                totalClientsResult,
                recentUsersResult,
                recentProjectsResult,
            ] = await Promise.all([
                db.select().from(agencies).where(eq(agencies.id, agencyId)).limit(1),
                db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), isNull(profiles.deletedAt))),
                db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), eq(profiles.isActive, true), isNull(profiles.deletedAt))),
                db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), isNull(projects.deletedAt))),
                db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), eq(projects.status, 'active'), isNull(projects.deletedAt))),
                db.select({ count: count() }).from(clients).where(and(eq(clients.agencyId, agencyId), isNull(clients.deletedAt))),
                db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), gte(profiles.createdAt, thirtyDaysAgo), isNull(profiles.deletedAt))),
                db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), gte(projects.createdAt, thirtyDaysAgo), isNull(projects.deletedAt))),
            ]);

            const agency = agencyRows[0] ?? null;

            return {
                success: true,
                data: {
                    agency: agency ? {
                        id: agency.id,
                        name: agency.name,
                        domain: agency.domain,
                        status: agency.status,
                        subscriptionPlan: agency.subscriptionPlan,
                        isActive: agency.isActive,
                        maxUsers: agency.maxUsers,
                        trialEndsAt: agency.trialEndsAt ?? null,
                        subscriptionEndsAt: agency.subscriptionEndsAt ?? null,
                    } : null,
                    metrics: {
                        totalUsers: totalUsersResult[0].count,
                        activeUsers: activeUsersResult[0].count,
                        totalProjects: totalProjectsResult[0].count,
                        activeProjects: activeProjectsResult[0].count,
                        totalClients: totalClientsResult[0].count,
                        totalInvoices: 0,
                        totalRevenue: 0,
                        monthlyRevenue: 0,
                        attendanceRecords: 0,
                        leaveRequests: { pending: 0, approved: 0, total: 0 },
                        recentActivity: {
                            newUsers: recentUsersResult[0].count,
                            newProjects: recentProjectsResult[0].count,
                            newInvoices: 0,
                        },
                    },
                },
            };
        } catch (error) {
            fastify.log.error({ error, context: 'dashboard metric failed' });
            return reply.status(500).send({ success: false, error: 'Failed to load dashboard metrics' });
        }
    });

    // List Agencies
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to list agencies');
            }

            const rawAgencies = await service.listAgencies();
            const response = listAgenciesResponseSchema.parse({ agencies: rawAgencies });
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
    fastify.get('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('read', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to view agency');
            }

            const rawAgency = await service.getAgency(id);
            const response = agencyResponseSchema.parse(rawAgency);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Create Agency (Public Registration)
    fastify.post('/create', async (request, reply) => {
        try {
            const validated = provisionAgencySchema.parse(request.body);
            const result = await service.provisionAgency(validated);
            return reply.code(202).send(result);
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Create Agency (Internal/Admin)
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to create agency');
            }

            // TODO: Import CreateAgencyInput from schemas
            const validated = createAgencySchema.parse(request.body);
            const rawAgency = await service.createAgency(validated);
            const response = agencyResponseSchema.parse(rawAgency.agency);
            return reply.code(201).send({ success: true, data: response });
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Complete Agency Setup
    fastify.post('/complete-setup', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            // Check permissions - 'create' 'Agency' or similar
            if (!request.ability.can('create', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to setup agency');
            }

            const validated = completeAgencySetupSchema.parse(request.body);
            const result = await service.completeAgencySetup(validated);
            return reply.code(202).send(result);
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Update Agency
    fastify.put('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('update', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to update agency');
            }

            const validated = updateAgencySchema.parse(request.body);
            const rawAgency = await service.updateAgency(id, validated);
            const response = agencyResponseSchema.parse(rawAgency);
            return { success: true, data: response };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Check Setup Status
    fastify.get('/check-setup', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const { domain } = request.query as { domain: string };
            const isComplete = await service.isSetupComplete(domain);
            return { success: true, data: { setupComplete: isComplete } };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Get Agency Users
    fastify.get('/:id/users', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('read', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to view agency users');
            }

            const agencyUsers = await db.select({
                id: profiles.id,
                email: users.email,
                full_name: profiles.fullName,
                is_active: profiles.isActive,
                created_at: profiles.createdAt,
            })
            .from(profiles)
            .innerJoin(users, eq(profiles.userId, users.id))
            .where(eq(profiles.agencyId, id));

            return { success: true, data: { users: agencyUsers } };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Get Agency Usage Metrics
    fastify.get('/:id/usage', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('read', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to view agency usage');
            }

            const [usersCount] = await db.select({ count: count() }).from(profiles).where(eq(profiles.agencyId, id));
            const [projectsCount] = await db.select({ count: count() }).from(projects).where(eq(projects.agencyId, id));
            const [clientsCount] = await db.select({ count: count() }).from(clients).where(eq(clients.agencyId, id));

            return { 
                success: true, 
                data: { 
                    usage: {
                        users: usersCount?.count || 0,
                        projects: projectsCount?.count || 0,
                        invoices: 0,
                        clients: clientsCount?.count || 0,
                        tasks: 0
                    }
                } 
            };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Export Backup Placeholder
    fastify.post('/:id/export-backup', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        if (!request.ability.can('read', 'Agency')) {
            throw new ForbiddenError('Insufficient permissions to export agency backup');
        }
        return reply.code(501).send({ success: false, message: 'Exporting full agency backup is not supported in the single-database architecture yet.' });
    });

    // Get Provisioning Status
    fastify.get('/provisioning/:jobId', async (request, reply) => {
        const { jobId } = request.params as { jobId: string };
        try {
            const result = await service.getProvisioningStatus(jobId);
            return { success: true, data: result };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Get Agency Settings (Single DB)
    fastify.get('/agency-settings', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        let agencyId: string | undefined;
        try {
            const query = request.query as { agencyId: string };
            agencyId = query.agencyId;
            if (!agencyId) {
                return reply.code(400).send({ success: false, message: 'agencyId is required' });
            }

            if (request.user.agencyId !== agencyId && !request.user.roles.includes('super_admin')) {
                throw new ForbiddenError('Insufficient permissions');
            }

            const { agencySettings } = await import('../../infrastructure/database/schema.js');

            const [settings] = await db.select().from(agencySettings).where(eq(agencySettings.agencyId, agencyId)).limit(1);
            return { success: true, data: { settings: mapToSnakeCase(settings || {}) } };
        } catch (error: any) {
            fastify.log.error({
                error: error.message,
                stack: error.stack,
                agencyId,
                context: 'GET /agencies/agency-settings'
            });
            throw error;
        }
    });

    // Update Agency Settings (Single DB)
    fastify.put('/agency-settings', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const body = request.body as { agencyId: string; settings: any };
            const { agencyId, settings } = body;

            if (!agencyId) {
                return reply.code(400).send({ success: false, message: 'agencyId is required' });
            }

            if (request.user.agencyId !== agencyId && !request.user.roles.includes('super_admin')) {
                throw new ForbiddenError('Insufficient permissions');
            }

            if (!request.ability.can('update', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to update settings');
            }

            const { agencySettings } = await import('../../infrastructure/database/schema.js');

            // Upsert logic
            let result;
            if (settings.id) {
                [result] = await db.update(agencySettings)
                    .set({ ...settings, updatedAt: new Date() })
                    .where(eq(agencySettings.id, settings.id))
                    .returning();
            } else {
                // Check if any row exists for this agency
                const [existing] = await db.select().from(agencySettings).where(eq(agencySettings.agencyId, agencyId)).limit(1);
                if (existing) {
                    [result] = await db.update(agencySettings)
                        .set({ ...settings, updatedAt: new Date() })
                        .where(eq(agencySettings.id, existing.id))
                        .returning();
                } else {
                    [result] = await db.insert(agencySettings)
                        .values({ ...settings, agencyId, agencyName: settings.agencyName || 'Agency' })
                        .returning();
                }
            }

            return { success: true, data: { settings: mapToSnakeCase(result) } };

        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // Delete Agency
    fastify.delete('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('delete', 'Agency')) {
                throw new ForbiddenError('Insufficient permissions to delete agency');
            }

            await service.deleteAgency(id);
            return { success: true, message: 'Agency deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });
};

export default agencyRoutes;
