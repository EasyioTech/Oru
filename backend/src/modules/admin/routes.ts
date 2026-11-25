import type { FastifyPluginAsync } from 'fastify';
import { AdminService } from './service.js';
import { AgencyProvisioningService } from '../agencies/services/provisioning.service.js';
import { ForbiddenError } from '../../utils/errors.js';
import { agencies } from '../../infrastructure/database/schema.js';
import { eq } from 'drizzle-orm';

const svc = (fastify: any) => new AdminService(fastify.db);

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/agencies', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    const body = request.body as any;
    const agencyName = body.name || body.agencyName || body.companyName;
    const email = body.adminEmail || body.contactEmail || body.email;

    if (!agencyName || !email) {
      return reply.code(400).send({ success: false, error: 'Agency name and admin email are required' });
    }

    const provisioning = new AgencyProvisioningService(fastify.log, fastify.db);
    const domain = (body.domain || agencyName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `agency-${Date.now().toString(36)}`;
    
    const result = await provisioning.completeAgencySetup({
      companyName: agencyName,
      domain,
      adminEmail: email,
      adminPhone: body.adminPhone || body.contactPhone,
      firstName: (body.adminName || 'Admin').split(' ')[0],
      lastName: (body.adminName || 'Admin').split(' ').slice(1).join(' ') || 'User',
      password: body.adminPassword || 'OruAdmin123!',
      plan: body.subscriptionPlan || body.plan || 'trial',
      maxUsers: body.maxUsers || 50,
      address: body.address || body.streetAddress,
      city: body.city,
      state: body.state,
      country: body.country || 'India',
    });

    const [createdAgency] = await fastify.db.select().from(agencies).where(eq(agencies.id, result.agencyId)).limit(1);
    return reply.code(201).send({ success: true, data: createdAgency });
  });
  fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    return { success: true, data: await svc(fastify).getPlatformStats() };
  });

  fastify.get('/agencies', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    const query = request.query as any;
    const agencies = await svc(fastify).listAgencies({
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0,
      search: query.search,
    });
    return { success: true, data: agencies };
  });

  fastify.get('/agencies/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const agency = await svc(fastify).getAgency(id);
    if (!agency) return { success: false, error: 'Agency not found' };
    return { success: true, data: agency };
  });

  fastify.patch('/agencies/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const agency = await svc(fastify).updateAgency(id, body);
    return { success: true, data: agency };
  });

  fastify.get('/users', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    const query = request.query as any;
    const users = await svc(fastify).listAllUsers({
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0,
    });
    return { success: true, data: users };
  });

  fastify.get('/audit-logs', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    const query = request.query as any;
    const logs = await svc(fastify).getAuditLogs({
      agencyId: query.agency_id,
      userId: query.user_id,
      resourceType: query.resource_type,
      action: query.action,
      from: query.from,
      to: query.to,
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0,
    });
    return { success: true, data: logs };
  });

  fastify.get('/settings', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    return { success: true, data: await svc(fastify).getPlatformSettings() };
  });

  fastify.put('/settings/:key', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    const { key } = request.params as { key: string };
    const body = request.body as any;
    const userId = (request.user as any).id as string;
    const setting = await svc(fastify).upsertPlatformSetting(key, body.value, userId, {
      description: body.description,
      isPublic: body.is_public,
    });
    return { success: true, data: setting };
  });

  fastify.get('/provisioning-jobs', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('manage', 'all')) throw new ForbiddenError();
    const { agency_id } = request.query as { agency_id?: string };
    const jobs = await svc(fastify).getProvisioningJobs(agency_id);
    return { success: true, data: jobs };
  });
};

export default adminRoutes;
