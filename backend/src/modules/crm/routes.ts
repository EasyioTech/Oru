import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { CrmService } from './service.js';
import { mapToSnakeCase } from '../../utils/case-transform.js';
import { ForbiddenError } from '../../utils/errors.js';

const crmRoutes: FastifyPluginAsync = async (fastify) => {
    const svc = (req: FastifyRequest) =>
        new CrmService((req as any).agencyDb || fastify.db, req.user.agencyId as string);

    fastify.get('/clients', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Client')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getClients(request.query as any)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/clients/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Client')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).getClientById(id)) };
    });

    fastify.post('/clients', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Client')) throw new ForbiddenError();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createClient(request.body)) });
    });

    fastify.put('/clients/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Client')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).updateClient(id, request.body)) };
    });

    fastify.delete('/clients/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'Client')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await svc(request).deleteClient(id);
        return { success: true };
    });

    fastify.get('/clients/:id/activities', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'CRMActivity')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: (await svc(request).getClientActivities(id)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/leads', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Lead')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getLeads(request.query as any)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.get('/leads/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Lead')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).getLeadById(id)) };
    });

    fastify.post('/leads', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Lead')) throw new ForbiddenError();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createLead(request.body)) });
    });

    fastify.put('/leads/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Lead')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).updateLead(id, request.body)) };
    });

    fastify.delete('/leads/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'Lead')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await svc(request).deleteLead(id);
        return { success: true };
    });

    fastify.post('/leads/:id/convert', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Lead') || request.ability.cannot('create', 'Client')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).convertLead(id)) };
    });

    fastify.get('/activities', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'CRMActivity')) throw new ForbiddenError();
        return { success: true, data: (await svc(request).getActivities(request.query as any)).map((d: any) => mapToSnakeCase(d)) };
    });

    fastify.post('/activities', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'CRMActivity')) throw new ForbiddenError();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(await svc(request).createActivity(request.body)) });
    });

    fastify.put('/activities/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'CRMActivity')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        return { success: true, data: mapToSnakeCase(await svc(request).updateActivity(id, request.body)) };
    });

    fastify.delete('/activities/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'CRMActivity')) throw new ForbiddenError();
        const { id } = request.params as { id: string };
        await svc(request).deleteActivity(id);
        return { success: true };
    });

    fastify.get('/metrics', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Lead')) throw new ForbiddenError();
        return { success: true, data: await svc(request).getMetrics() };
    });
};

export default crmRoutes;
