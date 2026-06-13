import { FastifyPluginAsync } from 'fastify';
import { db } from '../../infrastructure/database/index.js';
import { clients, leads, crmActivities } from '../../infrastructure/database/schema.js';
import { eq, and, ilike, or, count, sum } from 'drizzle-orm';
import { mapToSnakeCase } from '../../utils/case-transform.js';
import { ForbiddenError } from '../../utils/errors.js';

const crmRoutes: FastifyPluginAsync = async (fastify) => {
    
    // --- CLIENTS ---
    
    fastify.get('/clients', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Client')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { status, search } = request.query as any;
        const conditions: any[] = [eq(clients.agencyId, agencyId)];
        
        if (status && status !== 'all') conditions.push(eq(clients.status, status));
        if (search) {
            conditions.push(or(
                ilike(clients.name, `%${search}%`),
                ilike(clients.companyName, `%${search}%`),
                ilike(clients.email, `%${search}%`)
            ));
        }

        const data = await db.select().from(clients).where(and(...conditions));
        return { success: true, data: data.map(mapToSnakeCase) };
    });

    fastify.get('/clients/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Client')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const { id } = request.params as { id: string };
        const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.agencyId, agencyId)));
        if (!client) throw new Error('Client not found');
        return { success: true, data: mapToSnakeCase(client) };
    });

    fastify.post('/clients', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Client')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const body = request.body as any;
        const [client] = await db.insert(clients).values({ agencyId, ...body }).returning();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(client) });
    });

    fastify.put('/clients/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Client')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { id } = request.params as { id: string };
        const body = request.body as any;
        const [client] = await db.update(clients).set({ ...body, updatedAt: new Date() }).where(and(eq(clients.id, id), eq(clients.agencyId, agencyId))).returning();
        return { success: true, data: mapToSnakeCase(client) };
    });

    fastify.delete('/clients/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'Client')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { id } = request.params as { id: string };
        await db.update(clients).set({ deletedAt: new Date() }).where(and(eq(clients.id, id), eq(clients.agencyId, agencyId)));
        return { success: true };
    });

    fastify.get('/clients/:id/activities', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'CRMActivity')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { id } = request.params as { id: string };
        const data = await db.select().from(crmActivities).where(and(eq(crmActivities.clientId, id), eq(crmActivities.agencyId, agencyId)));
        return { success: true, data: data.map(mapToSnakeCase) };
    });

    // --- LEADS ---

    fastify.get('/leads', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Lead')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const { status, priority, search } = request.query as any;
        const conditions: any[] = [eq(leads.agencyId, agencyId)];
        
        if (status && status !== 'all') conditions.push(eq(leads.status, status));
        if (priority && priority !== 'all') conditions.push(eq(leads.priority, priority));
        if (search) {
            conditions.push(or(
                ilike(leads.companyName, `%${search}%`),
                ilike(leads.contactName, `%${search}%`)
            ));
        }

        const data = await db.select().from(leads).where(and(...conditions));
        return { success: true, data: data.map(mapToSnakeCase) };
    });

    fastify.get('/leads/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Lead')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { id } = request.params as { id: string };
        const [lead] = await db.select().from(leads).where(and(eq(leads.id, id), eq(leads.agencyId, agencyId)));
        if (!lead) throw new Error('Lead not found');
        return { success: true, data: mapToSnakeCase(lead) };
    });

    fastify.post('/leads', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'Lead')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const body = request.body as any;
        // Generate lead number if missing
        if (!body.leadNumber) body.leadNumber = `LD-${Date.now()}`;
        const [lead] = await db.insert(leads).values({ agencyId, ...body }).returning();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(lead) });
    });

    fastify.put('/leads/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Lead')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { id } = request.params as { id: string };
        const body = request.body as any;
        const [lead] = await db.update(leads).set({ ...body, updatedAt: new Date() }).where(and(eq(leads.id, id), eq(leads.agencyId, agencyId))).returning();
        return { success: true, data: mapToSnakeCase(lead) };
    });

    fastify.delete('/leads/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'Lead')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { id } = request.params as { id: string };
        await db.update(leads).set({ deletedAt: new Date() }).where(and(eq(leads.id, id), eq(leads.agencyId, agencyId)));
        return { success: true };
    });

    fastify.post('/leads/:id/convert', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'Lead') || request.ability.cannot('create', 'Client')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { id } = request.params as { id: string };
        const [lead] = await db.select().from(leads).where(and(eq(leads.id, id), eq(leads.agencyId, agencyId)));
        if (!lead) throw new Error('Lead not found');

        // Create client
        const clientNumber = `CL-${Date.now()}`;
        const [client] = await db.insert(clients).values({
            agencyId,
            clientNumber,
            name: lead.companyName,
            companyName: lead.companyName,
            email: lead.contactEmail || '',
            phone: lead.contactPhone,
            contactPerson: lead.contactName,
            status: 'active',
        }).returning();

        // Update lead
        await db.update(leads).set({
            status: 'won',
            convertedToClientId: client.id,
            convertedAt: new Date()
        }).where(eq(leads.id, id));

        return { success: true, data: mapToSnakeCase(client) };
    });

    // --- ACTIVITIES ---

    fastify.get('/activities', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'CRMActivity')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { leadId, clientId } = request.query as any;
        const conditions: any[] = [eq(crmActivities.agencyId, agencyId)];
        if (leadId) conditions.push(eq(crmActivities.leadId, leadId));
        if (clientId) conditions.push(eq(crmActivities.clientId, clientId));

        const data = await db.select().from(crmActivities).where(and(...conditions));
        return { success: true, data: data.map(mapToSnakeCase) };
    });

    fastify.post('/activities', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.ability.cannot('create', 'CRMActivity')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const body = request.body as any;
        const [activity] = await db.insert(crmActivities).values({ agencyId, ...body }).returning();
        return reply.code(201).send({ success: true, data: mapToSnakeCase(activity) });
    });

    fastify.put('/activities/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('update', 'CRMActivity')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        const { id } = request.params as { id: string };
        const body = request.body as any;
        const [activity] = await db.update(crmActivities).set({ ...body, updatedAt: new Date() }).where(and(eq(crmActivities.id, id), eq(crmActivities.agencyId, agencyId))).returning();
        return { success: true, data: mapToSnakeCase(activity) };
    });

    fastify.delete('/crm/activities/:id', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('delete', 'CRMActivity')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        if (!agencyId) throw new ForbiddenError('No agency context');
        const { id } = request.params as { id: string };
        await db.update(crmActivities).set({ deletedAt: new Date() }).where(and(eq(crmActivities.id, id), eq(crmActivities.agencyId, agencyId)));
        return { success: true };
    });

    // --- METRICS ---
    fastify.get('/metrics', { onRequest: [fastify.authenticate] }, async (request) => {
        if (request.ability.cannot('read', 'Lead')) throw new ForbiddenError('Insufficient permissions');
        const agencyId = request.user.agencyId as string;
        
        const [totalLeadsResult] = await db.select({ value: count() }).from(leads).where(eq(leads.agencyId, agencyId));
        const [activeLeadsResult] = await db.select({ value: count() }).from(leads).where(and(eq(leads.agencyId, agencyId), or(eq(leads.status, 'new'), eq(leads.status, 'contacted'), eq(leads.status, 'qualified'), eq(leads.status, 'proposal'), eq(leads.status, 'negotiation'))));
        const [wonLeadsResult] = await db.select({ value: count() }).from(leads).where(and(eq(leads.agencyId, agencyId), eq(leads.status, 'won')));
        const [pipelineValueResult] = await db.select({ value: sum(leads.value) }).from(leads).where(and(eq(leads.agencyId, agencyId), or(eq(leads.status, 'new'), eq(leads.status, 'contacted'), eq(leads.status, 'qualified'), eq(leads.status, 'proposal'), eq(leads.status, 'negotiation'))));
        
        return { 
            success: true, 
            data: {
                total_leads: totalLeadsResult.value,
                active_leads: activeLeadsResult.value,
                won_this_month: wonLeadsResult.value,
                pipeline_value: pipelineValueResult.value || 0
            } 
        };
    });
};

export default crmRoutes;
