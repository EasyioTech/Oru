import type { FastifyRequest, FastifyReply } from 'fastify';
import type { WorkspaceProfileService } from '../services/workspace-profile.service.js';

const TRACKED_ROUTES: Record<string, { action: string; module: string }> = {
  'POST /api/crm/clients': { action: 'create_client', module: 'crm' },
  'PATCH /api/crm/clients': { action: 'update_client', module: 'crm' },
  'POST /api/hr/employees': { action: 'hire_employee', module: 'hr' },
  'POST /api/finance/invoices': { action: 'create_invoice', module: 'finance' },
  'POST /api/projects': { action: 'create_project', module: 'projects' },
  'POST /api/inventory/products': { action: 'add_product', module: 'inventory' },
  'POST /api/procurement/orders': { action: 'create_po', module: 'procurement' },
};

export async function createActivityLogger(profileService: WorkspaceProfileService) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const route = `${req.method} ${req.url.split('?')[0].split('/').slice(0, 5).join('/')}`;
    const config = Object.entries(TRACKED_ROUTES).find(([pattern]) => route.includes(pattern))?.[1];

    if (!config || !req.user || !req.user.workspaceId) return;

    try {
      await profileService.logActivity(
        req.user.workspaceId,
        req.user.id,
        config.action,
        config.module,
        { url: req.url, method: req.method }
      );
    } catch (err) {
      req.log.error({ err }, 'Failed to log activity');
    }
  };
}
