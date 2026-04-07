import { FastifyPluginAsync } from 'fastify';
import { SystemService } from './service.js';
import { PlansService } from '../plans/service.js';
import { CatalogService } from '../catalog/service.js';
import { listPlansResponseSchema } from '../plans/schemas.js';
import { listPageCatalogResponseSchema } from '../catalog/schemas.js';
import { getMetricsResponseSchema, getSettingsResponseSchema, updateSystemSettingsSchema, emailTestRequestSchema, ticketsQuerySchema, createFeatureSchema, updateFeatureSchema, getSeoSettingsResponseSchema } from './schemas.js';
import { sendSystemEmail } from '../../infrastructure/email/index.js';
import { ForbiddenError } from '../../utils/errors.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';


const systemRoutes: FastifyPluginAsync = async (fastify) => {
    const service = new SystemService(fastify);

    // GET /sitemap.xml (Public)
    fastify.get('/sitemap.xml', async (request, reply) => {
        try {
            const baseUrl = 'https://oruerp.com';
            const catalogService = new CatalogService(fastify.log);
            const publicPages = await catalogService.listPublicPages();
            
            // Add Blog Posts to Sitemap
            const { BlogService } = await import('../blog/service.js');
            const blogService = new BlogService(fastify.log);
            const blogPosts = await blogService.listPublicPosts('', 1000);

            const staticPages = [
                '',
                '/pricing',
                '/industries/marketing-agencies',
                '/industries/software-development',
                '/compare/odoo',
                '/compare/sap-business-one',
                '/about',
                '/contact',
                '/blog'
            ];

            const catalogUrls = publicPages.map(page => {
                const slug = page.path.replace(/^\//, '').replace(/\//g, '-');
                return `/features/${slug}`;
            });

            const blogUrls = blogPosts.map(post => `/blog/${post.slug}`);

            const allPages = [...new Set([...staticPages, ...catalogUrls, ...blogUrls])];

            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allPages.map(page => `
    <url>
        <loc>${baseUrl}${page}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${page === '' ? '1.0' : '0.8'}</priority>
    </url>`).join('')}
</urlset>`;

            reply.type('application/xml').send(xml);
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send('Internal Server Error');
        }
    });

    // GET /robots.txt (Public)
    fastify.get('/robots.txt', async (request, reply) => {
        const robots = `User-agent: *
Allow: /
Sitemap: https://oruerp.com/sitemap.xml

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /
`;
        reply.type('text/plain').send(robots);
    });

    // GET /seo-settings (Public)
    fastify.get('/seo-settings', async (request) => {
        try {
            const data = await service.getSeoSettings();
            return { success: true, data: getSeoSettingsResponseSchema.parse(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system/seo-settings' });
            throw error;
        }
    });

    // GET /signup-preflight (Public)
    fastify.get('/signup-preflight', async (request) => {
        try {
            const data = await service.getSignupPreflight();
            return { success: true, data };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system/signup-preflight' });
            throw error;
        }
    });

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

            const data = await service.getMetrics();
            return { success: true, data };
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

    // GET /health/detailed (Requires Admin)
    fastify.get('/health/detailed', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            if (!request.ability.can('read', 'System')) {
                throw new ForbiddenError('Super Admin access required');
            }
            const data = await service.getDetailedHealth();
            return { success: true, data };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /health/detailed' });
            throw error;
        }
    });

    // GET /tickets - List tickets with query params
    fastify.get('/tickets', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            const query = ticketsQuerySchema.parse(request.query);
            const data = await service.getTickets(query);
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system/tickets' });
            throw error;
        }
    });

    // GET /tickets/summary
    fastify.get('/tickets/summary', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            const data = await service.getTicketsSummary();
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /tickets/summary' });
            throw error;
        }
    });

    // GET /features
    fastify.get('/features', { onRequest: [fastify.authenticate] }, async (request) => {
        try {
            const data = await service.getSystemFeatures();
            return { success: true, data: mapToSnakeCase(data) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /features' });
            throw error;
        }
    });

    // POST /features
    fastify.post('/features', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (!request.ability.can('create', 'System')) throw new ForbiddenError();
            const validated = createFeatureSchema.parse(request.body);
            const feature = await service.createFeature(validated);
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
            const validated = updateFeatureSchema.parse(request.body);
            const feature = await service.updateFeature(id, validated);
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
            return { success: true, data: { plans: responseData } };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system/plans' });
            throw error;
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
            return { success: true, data: safeItems.map(item => mapToSnakeCase(item)) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /page-catalog' });
            throw error;
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

    // GET /page-catalog/agencies/:id/pages
    fastify.get('/page-catalog/agencies/:id/pages', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            // Allow user to see their own agency pages (id='me')
            const agencyId = id === 'me' ? request.user.agencyId : id;

            if (!agencyId) {
                return { success: true, data: [] };
            }

            if (id !== 'me' && request.user.agencyId !== id && !request.user.roles.includes('super_admin')) {
                throw new ForbiddenError();
            }

            const pages = await service.getAgencyPages(agencyId);
            return { success: true, data: mapToSnakeCase(pages) };
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system/page-catalog/agencies/:id/pages' });
            throw error;
        }
    });

    // GET /agency-settings/:id
    fastify.get('/agency-settings/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const agencyId = id === 'me' ? request.user.agencyId : id;
            if (!agencyId) return { success: true, data: { settings: {} } };

            const { AgenciesService } = await import('../agencies/service.js');
            const agenciesService = new AgenciesService(fastify.log);
            const agency = await agenciesService.getAgency(agencyId);

            const { getAgencyDb } = await import('../../infrastructure/database/index.js');
            const agencyDb = await getAgencyDb(agency.databaseName);
            const { agencySettings } = await import('../../infrastructure/database/schema.js');

            try {
                const [settings] = await agencyDb.select().from(agencySettings).limit(1);
                return { success: true, data: { settings: mapToSnakeCase(settings || {}) } };
            } catch (err: any) {
                if (err.code === '42P01') {
                    return { success: true, data: { settings: {} } };
                }
                throw err;
            }
        } catch (error) {
            fastify.log.error({ error, context: 'GET /system/agency-settings/:id' });
            return { success: true, data: { settings: {} } }; // Fallback
        }
    });

};

export default systemRoutes;
