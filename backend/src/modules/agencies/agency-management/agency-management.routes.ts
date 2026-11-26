import { FastifyPluginAsync } from 'fastify';
import { AgencyManagementService } from './agency-management.service.js';
import {
  listAgenciesResponseSchema,
  agencyResponseSchema,
  createAgencySchema,
  updateAgencySchema,
  completeAgencySetupSchema,
  provisionAgencySchema,
} from '../schemas.js';
import { ForbiddenError } from '../../../utils/errors.js';
import { provisionNewAgency } from '../tenant-provisioning/atomic-tenant-provisioner.js';
import { db } from '../../../infrastructure/database/index.js';

export const agencyManagementRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new AgencyManagementService(fastify.log);

  // Check Domain Availability (Public)
  fastify.get('/check-domain', async (request) => {
    const domain = (request.query as { domain: string }).domain;
    return service.checkDomainAvailability(domain);
  });

  // Check Setup Status (Public/Auth)
  fastify.get('/check-setup', async (request) => {
    const { domain } = request.query as { domain: string };
    const isComplete = await service.isSetupComplete(domain);
    return { success: true, data: { setupComplete: isComplete } };
  });

  // Public Registration Endpoint
  fastify.post('/create', async (request, reply) => {
    const validated = provisionAgencySchema.parse(request.body);
    const result = await provisionNewAgency(
      db,
      {
        agencyName: validated.agencyName,
        adminEmail: validated.adminEmail,
        adminName: validated.adminName,
        adminPassword: validated.adminPassword,
        adminPhone: validated.adminPhone,
        domain: validated.domain,
        subscriptionPlan: (validated.subscriptionPlan as any) || 'trial',
        industry: validated.industry,
        primaryFocus: validated.primaryFocus,
        companySize: validated.companySize,
        timezone: validated.timezone,
        enableGST: validated.enableGST,
        streetAddress: validated.streetAddress,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        country: validated.country,
        billingEmail: validated.billingEmail,
        taxId: validated.taxId,
        jwt: fastify.jwt,
      },
      fastify.log
    );
    return reply.code(201).send({ success: true, data: result });
  });

  // Complete Agency Setup (Authenticated or Admin)
  fastify.post('/complete-setup', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const validated = completeAgencySetupSchema.parse(request.body);
    const result = await provisionNewAgency(
      db,
      {
        agencyName: validated.companyName,
        adminEmail: validated.adminEmail,
        adminName: `${validated.firstName || 'Admin'} ${validated.lastName || 'User'}`.trim(),
        adminPassword: validated.password,
        adminPhone: validated.adminPhone,
        domain: validated.domain,
        subscriptionPlan: (validated.plan as any) || 'trial',
        existingAgencyId: validated.id,
        address: validated.streetAddress || validated.address,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        country: validated.country,
        taxId: validated.taxId,
        billingEmail: validated.billingEmail,
        metadata: validated.metadata,
        settings: validated.settings,
        jwt: fastify.jwt,
      },
      fastify.log
    );
    return reply.code(201).send({ success: true, data: result });
  });

  // List Agencies (Admin Guarded)
  fastify.get('/', { onRequest: [fastify.authenticate] }, async (request) => {
    if (!request.ability.can('read', 'Agency')) {
      throw new ForbiddenError('Insufficient permissions to list agencies');
    }
    const rawAgencies = await service.listAgencies();
    const response = listAgenciesResponseSchema.parse({ agencies: rawAgencies });
    return { success: true, data: response };
  });

  // Get Agency (Admin / Owner Guarded)
  fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    if (!request.ability.can('read', 'Agency')) {
      throw new ForbiddenError('Insufficient permissions to view agency');
    }
    const rawAgency = await service.getAgency(id);
    return { success: true, data: agencyResponseSchema.parse(rawAgency) };
  });

  // Create Agency (Internal/Admin)
  fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    if (!request.ability.can('create', 'Agency')) {
      throw new ForbiddenError('Insufficient permissions to create agency');
    }
    const validated = createAgencySchema.parse(request.body);
    const result = await provisionNewAgency(
      db,
      {
        agencyName: validated.name,
        domain: validated.domain,
        adminEmail: validated.contactEmail || `admin@${validated.domain || 'agency'}.oruerp.com`,
        adminPassword: 'OruPassword123!',
        subscriptionPlan: (validated.subscriptionPlan as any) || 'trial',
        maxUsers: validated.maxUsers || 50,
        maxStorageGB: validated.maxStorageGB || 10,
        address: validated.address || undefined,
        city: validated.city || undefined,
        state: validated.state || undefined,
        postalCode: validated.postalCode || undefined,
        country: validated.country || 'India',
        taxId: validated.taxId || undefined,
        settings: (validated.settings as any) || undefined,
        metadata: (validated.metadata as any) || undefined,
      },
      fastify.log
    );
    return reply.code(201).send({ success: true, data: agencyResponseSchema.parse(result.agency) });
  });

  // Update Agency
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    if (!request.ability.can('update', 'Agency')) {
      throw new ForbiddenError('Insufficient permissions to update agency');
    }
    const validated = updateAgencySchema.parse(request.body);
    const rawAgency = await service.updateAgency(id, validated);
    return { success: true, data: agencyResponseSchema.parse(rawAgency) };
  });

  // Delete Agency
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    if (!request.ability.can('delete', 'Agency')) {
      throw new ForbiddenError('Insufficient permissions to delete agency');
    }
    await service.deleteAgency(id);
    return { success: true, message: 'Agency deleted successfully' };
  });
};
