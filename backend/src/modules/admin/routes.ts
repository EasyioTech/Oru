import type { FastifyPluginAsync } from 'fastify';
import { AdminService } from './service.js';
import { ForbiddenError } from '../../utils/errors.js';

const svc = (fastify: any) => new AdminService(fastify.db);

const adminRoutes: FastifyPluginAsync = async (fastify) => {
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
