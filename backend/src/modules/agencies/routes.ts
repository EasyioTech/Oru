import { FastifyPluginAsync } from 'fastify';
import { agencyManagementRoutes } from './agency-management/agency-management.routes.js';
import { businessSettingsRoutes } from './business-settings/business-settings.routes.js';

/**
 * Main Fastify routes plugin for the Agencies module.
 * Automatically registered by Fastify autoLoad under /api/agencies.
 * Cleanly organizes sub-routes into dedicated subsystems:
 * - Agency Lifecycle & Management (/check-domain, /check-setup, /create, /complete-setup, /, /:id)
 * - Agency Business Settings & Metrics (/me/dashboard, /:id/users, /:id/usage, /agency-settings)
 */
const agencyRoutes: FastifyPluginAsync = async (fastify) => {
  // Register business settings and metric routes
  await fastify.register(businessSettingsRoutes);

  // Register agency management and lifecycle routes
  await fastify.register(agencyManagementRoutes);
};

export default agencyRoutes;
