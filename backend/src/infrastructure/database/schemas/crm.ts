
import { pgTable, uuid, text, timestamp, jsonb, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { agencies } from './agency.js';
import { users } from './users.js';
import { isNull } from 'drizzle-orm';

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
