
import { FastifyPluginAsync } from 'fastify';
import { AgenciesService } from './service.js';
import { listAgenciesResponseSchema, agencyResponseSchema, createAgencySchema, updateAgencySchema, completeAgencySetupSchema, provisionAgencySchema } from './schemas.js';
import { ForbiddenError } from '../../utils/errors.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';

const agencyRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new AgenciesService(fastify.log);

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

    // Get Agency
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
            const { database } = request.query as { database: string };
            const isComplete = await service.isSetupComplete(database);
            return { success: true, data: { setupComplete: isComplete } };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
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

    // Get Agency Settings (Dynamic DB)
    fastify.get('/agency-settings', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        let database: string | undefined;
        try {
            const query = request.query as { database: string };
            database = query.database;
            if (!database) {
                return reply.code(400).send({ success: false, message: 'Database name is required' });
            }

            // Verify user belongs to this agency or is super admin
            let userAgencyDb = null;
            if (request.user.agencyId) {
                try {
                    const agency = await service.getAgency(request.user.agencyId);
                    userAgencyDb = agency.databaseName;
                } catch (e) {
                    // unexpected if logged in user has invalid agencyId
                }
            }

            if (userAgencyDb !== database && !request.user.roles.includes('super_admin')) {
                throw new ForbiddenError('Insufficient permissions');
            }

            const { getAgencyDb } = await import('../../infrastructure/database/index.js');
            const agencyDb = await getAgencyDb(database);
            // agencySettings is now exported from schema.js via schemas/agency.ts
            const { agencySettings } = await import('../../infrastructure/database/schema.js');

            // Check if table exists/query settings
            try {
                const [settings] = await agencyDb.select().from(agencySettings).limit(1);
                return { success: true, data: { settings: mapToSnakeCase(settings || {}) } };
            } catch (error: any) {
                // If table doesn't exist, return empty
                if (error.code === '42P01') {
                    return { success: true, data: { settings: {} } };
                }
                throw error;
            }
        } catch (error: any) {
            fastify.log.error({
                error: error.message,
                stack: error.stack,
                database,
                context: 'GET /agencies/agency-settings'
            });
            throw error;
        }
    });

    // Update Agency Settings (Dynamic DB)
    fastify.put('/agency-settings', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            const body = request.body as { database: string; settings: any };
            const { database, settings } = body;

            if (!database) {
                return reply.code(400).send({ success: false, message: 'Database name is required' });
            }

            // Verify permissions
            let userAgencyDb = null;
            if (request.user.agencyId) {
                try {
                    const agency = await service.getAgency(request.user.agencyId);
                    userAgencyDb = agency.databaseName;
                } catch (e) {
                    // ignore
                }
            }

            if (userAgencyDb !== database && !request.user.roles.includes('super_admin')) {
                throw new ForbiddenError('Insufficient permissions');
            }

            // Check update permission
            if (!request.ability.can('update', 'Agency')) {
                // Or specific 'AgencySettings' ability
                throw new ForbiddenError('Insufficient permissions to update settings');
            }

            const { getAgencyDb } = await import('../../infrastructure/database/index.js');
            const agencyDb = await getAgencyDb(database);
            const { agencySettings } = await import('../../infrastructure/database/schema.js');
            const { eq } = await import('drizzle-orm');

            // Upsert logic
            let result;
            if (settings.id) {
                [result] = await agencyDb.update(agencySettings)
                    .set({ ...settings, updatedAt: new Date() })
                    .where(eq(agencySettings.id, settings.id))
                    .returning();
            } else {
                // Check if any row exists
                const [existing] = await agencyDb.select().from(agencySettings).limit(1);
                if (existing) {
                    [result] = await agencyDb.update(agencySettings)
                        .set({ ...settings, updatedAt: new Date() })
                        .where(eq(agencySettings.id, existing.id))
                        .returning();
                } else {
                    [result] = await agencyDb.insert(agencySettings)
                        .values(settings)
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
