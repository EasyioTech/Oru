import { FastifyPluginAsync } from 'fastify';
import { BusinessSettingsService } from './business-settings.service.js';
import { ProvisioningStatusTracker } from '../tenant-provisioning/provisioning-status-tracker.js';
import { ForbiddenError } from '../../../utils/errors.js';
import { mapToSnakeCase } from '../../../utils/case-transform.js';
import { db } from '../../../infrastructure/database/index.js';

export const businessSettingsRoutes: FastifyPluginAsync = async (fastify) => {
  const settingsService = new BusinessSettingsService(fastify.log);
  const statusTracker = new ProvisioningStatusTracker(fastify.log, db);

  // Agency Dashboard Metrics
  fastify.get('/me/dashboard', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as any;
    const agencyId = user?.agencyId;
    if (!agencyId) {
      return reply.status(400).send({ success: false, error: 'No agency context in token' });
    }
    try {
      const data = await settingsService.getDashboardMetrics(agencyId);
      return { success: true, data };
    } catch (error) {
      fastify.log.error({ error, context: 'dashboard metrics' });
      return reply.status(500).send({ success: false, error: 'Failed to load dashboard metrics' });
    }
  });

  // Agency Users List
  fastify.get('/:id/users', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;
    if (user.agencyId !== id && !user.roles?.includes('super_admin')) {
      throw new ForbiddenError('Insufficient permissions to view agency users');
    }
    const agencyUsers = await settingsService.getAgencyUsers(id);
    return { success: true, data: { users: agencyUsers } };
  });

  // Agency Resource Usage
  fastify.get('/:id/usage', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as any;
    if (user.agencyId !== id && !user.roles?.includes('super_admin')) {
      throw new ForbiddenError('Insufficient permissions to view agency usage');
    }
    const usage = await settingsService.getAgencyUsage(id);
    return { success: true, data: { usage } };
  });

  // Provisioning Job Status
  fastify.get('/provisioning/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const result = await statusTracker.getJobStatus(jobId);
    return { success: true, data: result };
  });

  // Get Agency Settings
  fastify.get('/agency-settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as any;
    const agencyId = (request.query as any)?.agencyId || user?.agencyId;
    if (!agencyId) {
      return reply.code(400).send({ success: false, message: 'agencyId is required' });
    }
    if (user.agencyId !== agencyId && !user.roles?.includes('super_admin')) {
      throw new ForbiddenError('Insufficient permissions');
    }
    const settings = await settingsService.getAgencySettings(agencyId);
    return { success: true, data: { settings: mapToSnakeCase(settings) } };
  });

  // Update Agency Settings
  fastify.put('/agency-settings', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const user = request.user as any;
    const body = (request.body as any) || {};
    const agencyId = body.agencyId || (request.query as any)?.agencyId || user?.agencyId;
    const settingsPayload = body.settings || body;
    if (!agencyId) {
      return reply.code(400).send({ success: false, message: 'agencyId is required' });
    }
    if (user.agencyId !== agencyId && !user.roles?.includes('super_admin')) {
      throw new ForbiddenError('Insufficient permissions');
    }
    const result = await settingsService.updateAgencySettings(agencyId, settingsPayload);
    return { success: true, data: { settings: mapToSnakeCase(result) } };
  });
};
