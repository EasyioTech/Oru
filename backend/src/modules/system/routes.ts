import { FastifyPluginAsync } from 'fastify';
import { SystemService } from './service.js';
import { PlansService } from '../plans/service.js';
import { CatalogService } from '../catalog/service.js';
import { listPlansResponseSchema } from '../plans/schemas.js';
import { listPageCatalogResponseSchema } from '../catalog/schemas.js';
import { getMetricsResponseSchema, getSettingsResponseSchema, updateSystemSettingsSchema, emailTestRequestSchema } from './schemas.js';
import { sendSystemEmail } from '../../infrastructure/email/index.js';
import { ForbiddenError } from '../../utils/errors.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';


const systemRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new SystemService(fastify);

    // GET /agencies/:id/data
    fastify.get('/agencies/:id/data', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            if (!request.ability.can('read', 'System')) {
                throw new ForbiddenError('Super Admin access required');
            }

            const rawData = await service.getAgencyData(id);
            // No strict response schema for now as it's a dynamic/heavy object, but should follow standard envelope
            // Ideally mapToSnakeCase here if the service doesn't do it, but service returns fields like full_name already snake/mixed.
            // Let's use mapToSnakeCase to be safe.
            return { success: true, data: mapToSnakeCase(rawData) };
        } catch (error) {
            request.log.error(error);
            throw error;
        }
    });

    // GET /metrics
    fastify.get('/metrics', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'System')) {
                throw new ForbiddenError('Super Admin access required');
            }

            const rawData = await service.getMetrics();
            const response = getMetricsResponseSchema.parse(rawData);
            return { success: true, data: response };
        } catch (error) {
            request.log.error(error);
            throw error;
        }
    });

    // GET /settings
    fastify.get('/settings', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('read', 'System')) {
                throw new ForbiddenError('Super Admin access required');
            }

            const rawData = await service.getSettings();
            const response = getSettingsResponseSchema.parse({ settings: rawData });
            return { success: true, data: response };
        } catch (error) {
            request.log.error(error);
            throw error;
        }
    });

    // PUT /settings
    fastify.put('/settings', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('update', 'System')) {
                throw new ForbiddenError('Super Admin access required');
            }

            const validatedBody = updateSystemSettingsSchema.parse(request.body);
            const rawData = await service.updateSettings(validatedBody);
            const response = getSettingsResponseSchema.parse({ settings: rawData });
            return { success: true, data: response };
        } catch (error) {
            request.log.error(error);
            throw error;
        }
    });

    // POST /email/test
    fastify.post('/email/test', {
        onRequest: [fastify.authenticate],
    }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'System')) {
                throw new ForbiddenError('Super Admin access required');
            }

            const { to } = emailTestRequestSchema.parse(request.body);
            const info = await sendSystemEmail(to, 'Oru ERP - System Test Email', `
                <h1>System Email Test</h1>
                <p>This is a test email from your Oru ERP System Dashboard.</p>
                <p>Time: ${new Date().toISOString()}</p>
            `);

            return { success: true, data: { messageId: info.messageId } };
        } catch (error) {
            request.log.error(error);
            throw error;
        }
    });

    // GET /maintenance-status (Public - no auth required)
    fastify.get('/maintenance-status', async (request) => {
        try {
            const data = await service.getMaintenanceStatus();
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // GET /branding (Public - no auth required)
    fastify.get('/branding', async (request) => {
        try {
            const data = await service.getBranding();
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error(error);
            throw error;
        }
    });

    // GET /usage/realtime
    fastify.get('/usage/realtime', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            const data = await service.getRealtimeUsage();
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /usage/realtime' });
            return { success: true, data: { activeUsers: 0, activeSessions: 0, requestsPerSecond: 0, timestamp: new Date().toISOString() } };
        }
    });

    // GET /tickets - List tickets with query params
    fastify.get('/tickets', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            const data = await service.getTickets(request.query as any);
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system/tickets' });
            return { success: true, data: { tickets: [] } };
        }
    });

    // GET /tickets/summary
    fastify.get('/tickets/summary', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            const data = await service.getTicketsSummary();
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /tickets/summary' });
            return { success: true, data: { stats: { total: 0, open: 0, inProgress: 0, resolved: 0, avgResolutionTime: 0, newToday: 0, resolvedToday: 0 }, recentTickets: [] } };
        }
    });

    // GET /features
    fastify.get('/features', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            const data = await service.getSystemFeatures();
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /features' });
            return { success: true, data: { features: [], enabledModules: [] } };
        }
    });

    // POST /features
    fastify.post('/features', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'System')) throw new ForbiddenError();
            const feature = await service.createFeature(request.body);
            return reply.code(201).send({ success: true, data: { feature: mapToSnakeCase(feature) } });
        } catch (error) {
            fastify.log.error({ error, context: 'POST /system/features' });
            throw error;
        }
    });

    // PUT /features/:id
    fastify.put('/features/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('update', 'System')) throw new ForbiddenError();
            const { id } = request.params as { id: string };
            const feature = await service.updateFeature(id, request.body);
            return { success: true, data: { feature: mapToSnakeCase(feature) } };
        } catch (error) {
            fastify.log.error({ error, context: 'PUT /system/features' });
            throw error;
        }
    });

    // DELETE /features/:id
    fastify.delete('/features/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('delete', 'System')) throw new ForbiddenError();
            const { id } = request.params as { id: string };
            await service.deleteFeature(id);
            return { success: true };
        } catch (error) {
            fastify.log.error({ error, context: 'DELETE /system/features' });
            throw error;
        }
    });

    // GET /plans (Proxy to PlansService)
    fastify.get('/plans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const plansService = new PlansService(fastify.log);
            const plans = await plansService.listPlans();
            const safePlans = Array.isArray(plans) ? plans : [];
            const responseData = safePlans.map(plan => mapToSnakeCase(plan));
            return { success: true, data: { plans: responseData } }; // Wrapped for plans.ts service
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system/plans' });
            return { success: true, data: { plans: [] } };
        }
    });

    // POST /plans
    fastify.post('/plans', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'System')) throw new ForbiddenError();
            const plansService = new PlansService(fastify.log);
            const plan = await plansService.createPlan(request.body);
            return reply.code(201).send({ success: true, data: { plan: mapToSnakeCase(plan) } });
        } catch (error) {
            fastify.log.error({ error, context: 'POST /system/plans' });
            throw error;
        }
    });

    // PUT /plans/:id
    fastify.put('/plans/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('update', 'System')) throw new ForbiddenError();
            const { id } = request.params as { id: string };
            const plansService = new PlansService(fastify.log);
            const plan = await plansService.updatePlan(id, request.body);
            return { success: true, data: { plan: mapToSnakeCase(plan) } };
        } catch (error) {
            fastify.log.error({ error, context: 'PUT /system/plans' });
            throw error;
        }
    });

    // DELETE /plans/:id
    fastify.delete('/plans/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('delete', 'System')) throw new ForbiddenError();
            const { id } = request.params as { id: string };
            const plansService = new PlansService(fastify.log);
            await plansService.deletePlan(id);
            return { success: true };
        } catch (error) {
            fastify.log.error({ error, context: 'DELETE /system/plans' });
            throw error;
        }
    });

    // GET /page-catalog (Proxy to CatalogService)
    fastify.get('/page-catalog', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            const catalogService = new CatalogService(fastify.log);
            const items = await catalogService.listPages();
            const safeItems = Array.isArray(items) ? items : [];
            // usePageCatalog.ts expects data to be the array directly
            return { success: true, data: safeItems.map(item => mapToSnakeCase(item)) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /page-catalog' });
            return { success: true, data: [] };
        }
    });

    // POST /page-catalog
    fastify.post('/page-catalog', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'System')) throw new ForbiddenError();
            const catalogService = new CatalogService(fastify.log);
            const page = await catalogService.createPage(request.body);
            return reply.code(201).send({ success: true, data: mapToSnakeCase(page) });
        } catch (error) {
            fastify.log.error({ error, context: 'POST /system/page-catalog' });
            throw error;
        }
    });

    // PUT /page-catalog/:id
    fastify.put('/page-catalog/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('update', 'System')) throw new ForbiddenError();
            const { id } = request.params as { id: string };
            const catalogService = new CatalogService(fastify.log);
            const page = await catalogService.updatePage(id, request.body);
            return { success: true, data: mapToSnakeCase(page) };
        } catch (error) {
            fastify.log.error({ error, context: 'PUT /system/page-catalog' });
            throw error;
        }
    });

    // DELETE /page-catalog/:id
    fastify.delete('/page-catalog/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('delete', 'System')) throw new ForbiddenError();
            const { id } = request.params as { id: string };
            const catalogService = new CatalogService(fastify.log);
            await catalogService.deletePage(id);
            return { success: true };
        } catch (error) {
            fastify.log.error({ error, context: 'DELETE /system/page-catalog' });
            throw error;
        }
    });

};

export default systemRoutes;
