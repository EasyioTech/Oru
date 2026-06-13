
import { pgTable, uuid, text, timestamp, jsonb, boolean, index, uniqueIndex, numeric, date } from 'drizzle-orm/pg-core';
import { agencies } from './agency.js';
import { users } from './users.js';
import { isNull, sql } from 'drizzle-orm';
import { profiles } from './auth.js';

/**
 * Clients Table
 * CRM module for managing agency clients
 */
export const clients = pgTable('clients', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),

    // Core Info
    clientNumber: text('client_number').notNull(), // CL-2024-001
    name: text('name').notNull(),
    companyName: text('company_name'),
    industry: text('industry'),
    status: text('status').default('active').notNull(), // active, inactive, lead

    // Contact Info
    email: text('email').notNull(),
    phone: text('phone'),
    website: text('website'),

    // Primary Contact Person
    contactPerson: text('contact_person'),
    contactPosition: text('contact_position'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),

    // Address
    address: text('address'),
    city: text('city'),
    state: text('state'),
    postalCode: text('postal_code'),
    country: text('country'),

    // Billing Address (if different)
    billingAddress: text('billing_address'),
    billingCity: text('billing_city'),
    billingState: text('billing_state'),
    billingPostalCode: text('billing_postal_code'),
    billingCountry: text('billing_country'),
    taxId: text('tax_id'),
    paymentTerms: text('payment_terms'), // net15, net30, due_on_receipt

    notes: text('notes'),
    metadata: jsonb('metadata').default({}).notNull(),

    createdBy: uuid('created_by').references(() => users.id),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdIdx: index('idx_clients_agency_id').on(table.agencyId),
    clientNumberAgencyIdx: uniqueIndex('idx_clients_client_number_agency').on(table.clientNumber, table.agencyId).where(isNull(table.deletedAt)),
    emailIdx: index('idx_clients_email').on(table.email),
    statusIdx: index('idx_clients_status').on(table.status),
}));

export const leads = pgTable('leads', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    leadNumber: text('lead_number').notNull(),
    companyName: text('company_name').notNull(),
    contactName: text('contact_name').notNull(),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    
    source: text('source'), // website, referral, cold_outreach, social, event, other
    status: text('status').default('new').notNull(), // new, contacted, qualified, proposal, negotiation, won, lost
    priority: text('priority').default('medium').notNull(), // low, medium, high
    
    value: numeric('value', { precision: 12, scale: 2 }),
    currency: text('currency').default('USD'),
    
    assignedTo: uuid('assigned_to').references(() => profiles.id),
    expectedClose: date('expected_close'),
    notes: text('notes'),
    
    convertedToClientId: uuid('converted_to_client_id').references(() => clients.id),
    convertedAt: timestamp('converted_at', { withTimezone: true }),
    
    createdBy: uuid('created_by').references(() => profiles.id),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdLeadNumberIdx: uniqueIndex('idx_leads_agency_lead_number').on(table.agencyId, table.leadNumber).where(isNull(table.deletedAt)),
    agencyIdIdx: index('idx_leads_agency_id').on(table.agencyId),
    statusIdx: index('idx_leads_status').on(table.status),
    assignedToIdx: index('idx_leads_assigned_to').on(table.assignedTo),
}));

export const crmActivities = pgTable('crm_activities', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }),
    
    type: text('type').notNull(), // call, email, meeting, demo, follow_up, note
    subject: text('subject').notNull(),
    description: text('description'),
    status: text('status').default('pending').notNull(), // pending, completed, cancelled
    
    dueDate: timestamp('due_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    
    assignedTo: uuid('assigned_to').references(() => profiles.id),
    createdBy: uuid('created_by').references(() => profiles.id),
    
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdIdx: index('idx_crm_activities_agency_id').on(table.agencyId),
    leadIdIdx: index('idx_crm_activities_lead_id').on(table.leadId),
    clientIdIdx: index('idx_crm_activities_client_id').on(table.clientId),
    statusIdx: index('idx_crm_activities_status').on(table.status),
    dueDateIdx: index('idx_crm_activities_due_date').on(table.dueDate),
}));
