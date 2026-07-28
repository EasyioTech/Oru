import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { WorkspaceProfileService, CapabilityEngine, ContextEngine, HealthScorer, RecommendationEngine } from './index.js';
import { ForbiddenError } from '../../utils/errors.js';

const coreRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = { onRequest: [fastify.authenticate] };

  fastify.get<{ Params: { workspaceId: string } }>('/workspace/:workspaceId/profile', auth, async (request) => {
    const { workspaceId } = request.params;
    if (!request.user || request.user.id !== workspaceId) throw new ForbiddenError();

    const db = (request as any).agencyDb || fastify.db;
    const profileSvc = new WorkspaceProfileService(db, fastify.log);
    const profile = await profileSvc.getProfile(workspaceId);

    return { success: true, data: profile };
  });

  fastify.get<{ Params: { workspaceId: string } }>('/workspace/:workspaceId/capabilities', auth, async (request) => {
    const { workspaceId } = request.params;
    if (!request.user || request.user.id !== workspaceId) throw new ForbiddenError();

    const db = (request as any).agencyDb || fastify.db;
    const profileSvc = new WorkspaceProfileService(db, fastify.log);
    const profile = await profileSvc.getProfile(workspaceId);

    const modulesJson = profile?.modules_json || {};
    const allModules = ['crm', 'hr', 'projects', 'finance', 'inventory', 'procurement', 'reports', 'admin'];

    const modules = allModules.map((mod) => ({
      module: mod,
      enabled: modulesJson[mod]?.enabled || false,
      available: modulesJson[mod]?.available !== false,
      dataCount: modulesJson[mod]?.data_count || 0,
      usageScore: modulesJson[mod]?.usage_score || 0,
      features: modulesJson[mod]?.features || [],
    }));

    return {
      success: true,
      data: {
        workspace_id: workspaceId,
        modules,
        feature_flags: { /* placeholder */ },
      }
    };
  });

  fastify.get<{ Params: { workspaceId: string } }>('/workspace/:workspaceId/dashboard-context', auth, async (request) => {
    const { workspaceId } = request.params;
    if (!request.user || request.user.id !== workspaceId) throw new ForbiddenError();

    const db = (request as any).agencyDb || fastify.db;
    const profileSvc = new WorkspaceProfileService(db, fastify.log);
    const profile = await profileSvc.getProfile(workspaceId);

    const capEngine = new CapabilityEngine();
    const recEngine = new RecommendationEngine();
    const ctxEngine = new ContextEngine(capEngine, recEngine);
    const context = ctxEngine.buildDashboardContext(profile);

    return { success: true, data: context };
  });

  fastify.post<{ Params: { workspaceId: string }; Body: { action: string; module?: string; metadata?: Record<string, any> } }>(
    '/workspace/:workspaceId/activity',
    auth,
    async (request) => {
      const { workspaceId } = request.params;
      const { action, module, metadata } = request.body;

      if (!request.user || request.user.id !== workspaceId) throw new ForbiddenError();

      const db = (request as any).agencyDb || fastify.db;
      const profileSvc = new WorkspaceProfileService(db, fastify.log);
      await profileSvc.logActivity(workspaceId, request.user.id, action, module, metadata);

      return { success: true };
    }
  );

  fastify.get<{ Params: { workspaceId: string } }>('/workspace/:workspaceId/health', auth, async (request) => {
    const { workspaceId } = request.params;
    if (!request.user || request.user.id !== workspaceId) throw new ForbiddenError();

    const db = (request as any).agencyDb || fastify.db;
    const profileSvc = new WorkspaceProfileService(db, fastify.log);
    const profile = await profileSvc.getProfile(workspaceId);

    const healthScorer = new HealthScorer();
    const score = healthScorer.calculateHealth(profile);
    const status = healthScorer.classifyHealth(score);
    const needs = healthScorer.identifyNeeds(profile);
    const strengths = healthScorer.identifyStrengths(profile);

    return { success: true, data: { score, status, needs, strengths } };
  });

  fastify.post<{ Params: { workspaceId: string }; Body: { module: string; action: 'enable' | 'disable' } }>(
    '/workspace/:workspaceId/modules/:module',
    auth,
    async (request) => {
      const { workspaceId, module } = request.params;
      const { action } = request.body;

      if (!request.user || request.user.id !== workspaceId) throw new ForbiddenError();

      const db = (request as any).agencyDb || fastify.db;
      const profileSvc = new WorkspaceProfileService(db, fastify.log);
      const profile = await profileSvc.getProfile(workspaceId);

      if (!profile) throw new Error('Workspace profile not found');

      const modulesJson = profile.modules_json || {};
      if (!modulesJson[module]) {
        modulesJson[module] = { enabled: false };
      }

      modulesJson[module].enabled = action === 'enable';

      await profileSvc.updateProfile(workspaceId, {
        modules_json: modulesJson,
      });

      await profileSvc.logActivity(
        workspaceId,
        request.user.id,
        action === 'enable' ? 'enable_module' : 'disable_module',
        'core',
        { module }
      );

      return { success: true, data: { module, enabled: modulesJson[module].enabled } };
    }
  );
};

export default coreRoutes;
