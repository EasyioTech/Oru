import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { clients, leads, crmActivities } from './schema.js';

export type Client = InferSelectModel<typeof clients>;
export type NewClient = InferInsertModel<typeof clients>;
export type Lead = InferSelectModel<typeof leads>;
export type NewLead = InferInsertModel<typeof leads>;
export type CRMActivity = InferSelectModel<typeof crmActivities>;
export type NewCRMActivity = InferInsertModel<typeof crmActivities>;

export interface ClientFilters {
    status?: string;
    search?: string;
}

export interface LeadFilters {
    status?: string;
    priority?: string;
    search?: string;
}

export interface ActivityFilters {
    leadId?: string;
    clientId?: string;
}
