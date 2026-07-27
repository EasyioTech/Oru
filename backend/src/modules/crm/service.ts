import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, or, count, sum, SQL } from 'drizzle-orm';
import { clients, leads, crmActivities } from './schema.js';
import { ClientFilters, LeadFilters, ActivityFilters } from './types.js';
import { indexClients, removeFromIndex } from '../../infrastructure/meilisearch/indexer.js';

export class CrmService {
    constructor(
        private db: NodePgDatabase<any> | any,
        private agencyId: string
    ) { }

    // --- CLIENTS ---

    async getClients(filters: ClientFilters) {
        const conditions: SQL[] = [eq(clients.agencyId, this.agencyId)];
        if (filters.status && filters.status !== 'all') conditions.push(eq(clients.status, filters.status));
        if (filters.search) {
            conditions.push(or(
                ilike(clients.name, `%${filters.search}%`),
                ilike(clients.companyName, `%${filters.search}%`),
                ilike(clients.email, `%${filters.search}%`)
            ) as SQL);
        }

        const data = await this.db.select().from(clients).where(and(...conditions));
        return data;
    }

    async getClientById(id: string) {
        const [client] = await this.db.select().from(clients).where(and(eq(clients.id, id), eq(clients.agencyId, this.agencyId)));
        if (!client) throw new Error('Client not found');
        return client;
    }

    async createClient(body: any) {
        const [client] = await this.db.insert(clients).values({ agencyId: this.agencyId, ...body }).returning();
        Promise.resolve().then(() => indexClients(this.agencyId, [client]).catch(() => {}));
        return client;
    }

    async updateClient(id: string, body: any) {
        const [client] = await this.db.update(clients).set({ ...body, updatedAt: new Date() }).where(and(eq(clients.id, id), eq(clients.agencyId, this.agencyId))).returning();
        Promise.resolve().then(() => indexClients(this.agencyId, [client]).catch(() => {}));
        return client;
    }

    async deleteClient(id: string) {
        await this.db.update(clients).set({ deletedAt: new Date() }).where(and(eq(clients.id, id), eq(clients.agencyId, this.agencyId)));
        Promise.resolve().then(() => removeFromIndex('clients', id).catch(() => {}));
    }

    async getClientActivities(id: string) {
        const data = await this.db.select().from(crmActivities).where(and(eq(crmActivities.clientId, id), eq(crmActivities.agencyId, this.agencyId)));
        return data;
    }

    // --- LEADS ---

    async getLeads(filters: LeadFilters) {
        const conditions: SQL[] = [eq(leads.agencyId, this.agencyId)];
        if (filters.status && filters.status !== 'all') conditions.push(eq(leads.status, filters.status));
        if (filters.priority && filters.priority !== 'all') conditions.push(eq(leads.priority, filters.priority));
        if (filters.search) {
            conditions.push(or(
                ilike(leads.companyName, `%${filters.search}%`),
                ilike(leads.contactName, `%${filters.search}%`)
            ) as SQL);
        }

        const data = await this.db.select().from(leads).where(and(...conditions));
        return data;
    }

    async getLeadById(id: string) {
        const [lead] = await this.db.select().from(leads).where(and(eq(leads.id, id), eq(leads.agencyId, this.agencyId)));
        if (!lead) throw new Error('Lead not found');
        return lead;
    }

    async createLead(body: any) {
        if (!body.leadNumber) body.leadNumber = `LD-${Date.now()}`;
        const [lead] = await this.db.insert(leads).values({ agencyId: this.agencyId, ...body }).returning();
        Promise.resolve().then(() => indexClients(this.agencyId, [lead]).catch(() => {}));
        return lead;
    }

    async updateLead(id: string, body: any) {
        const [lead] = await this.db.update(leads).set({ ...body, updatedAt: new Date() }).where(and(eq(leads.id, id), eq(leads.agencyId, this.agencyId))).returning();
        Promise.resolve().then(() => indexClients(this.agencyId, [lead]).catch(() => {}));
        return lead;
    }

    async deleteLead(id: string) {
        await this.db.update(leads).set({ deletedAt: new Date() }).where(and(eq(leads.id, id), eq(leads.agencyId, this.agencyId)));
        Promise.resolve().then(() => removeFromIndex('clients', id).catch(() => {}));
    }

    async convertLead(id: string) {
        const [lead] = await this.db.select().from(leads).where(and(eq(leads.id, id), eq(leads.agencyId, this.agencyId)));
        if (!lead) throw new Error('Lead not found');

        const clientNumber = `CL-${Date.now()}`;
        const [client] = await this.db.insert(clients).values({
            agencyId: this.agencyId,
            clientNumber,
            name: lead.companyName,
            companyName: lead.companyName,
            email: lead.contactEmail || '',
            phone: lead.contactPhone,
            contactPerson: lead.contactName,
            status: 'active',
        }).returning();

        await this.db.update(leads).set({
            status: 'won',
            convertedToClientId: client.id,
            convertedAt: new Date()
        }).where(eq(leads.id, id));

        return client;
    }

    // --- ACTIVITIES ---

    async getActivities(filters: ActivityFilters) {
        const conditions: SQL[] = [eq(crmActivities.agencyId, this.agencyId)];
        if (filters.leadId) conditions.push(eq(crmActivities.leadId, filters.leadId));
        if (filters.clientId) conditions.push(eq(crmActivities.clientId, filters.clientId));

        const data = await this.db.select().from(crmActivities).where(and(...conditions));
        return data;
    }

    async createActivity(body: any) {
        const [activity] = await this.db.insert(crmActivities).values({ agencyId: this.agencyId, ...body }).returning();
        return activity;
    }

    async updateActivity(id: string, body: any) {
        const [activity] = await this.db.update(crmActivities).set({ ...body, updatedAt: new Date() }).where(and(eq(crmActivities.id, id), eq(crmActivities.agencyId, this.agencyId))).returning();
        return activity;
    }

    async deleteActivity(id: string) {
        await this.db.update(crmActivities).set({ deletedAt: new Date() }).where(and(eq(crmActivities.id, id), eq(crmActivities.agencyId, this.agencyId)));
    }

    // --- METRICS ---

    async getMetrics() {
        const [totalLeadsResult] = await this.db.select({ value: count() }).from(leads).where(eq(leads.agencyId, this.agencyId));
        const [activeLeadsResult] = await this.db.select({ value: count() }).from(leads).where(and(eq(leads.agencyId, this.agencyId), or(eq(leads.status, 'new'), eq(leads.status, 'contacted'), eq(leads.status, 'qualified'), eq(leads.status, 'proposal'), eq(leads.status, 'negotiation'))));
        const [wonLeadsResult] = await this.db.select({ value: count() }).from(leads).where(and(eq(leads.agencyId, this.agencyId), eq(leads.status, 'won')));
        const [pipelineValueResult] = await this.db.select({ value: sum(leads.value) }).from(leads).where(and(eq(leads.agencyId, this.agencyId), or(eq(leads.status, 'new'), eq(leads.status, 'contacted'), eq(leads.status, 'qualified'), eq(leads.status, 'proposal'), eq(leads.status, 'negotiation'))));
        
        return {
            total_leads: totalLeadsResult.value,
            active_leads: activeLeadsResult.value,
            won_this_month: wonLeadsResult.value,
            pipeline_value: pipelineValueResult.value || 0
        };
    }
}
