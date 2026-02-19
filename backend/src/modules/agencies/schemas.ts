
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { agencies } from '../../infrastructure/database/schema.js';
import { mapToCamelCase, mapToSnakeCase } from '../../utils/case-transform.js';

export const agencySchema = createSelectSchema(agencies);

export const createAgencySchema = z.preprocess(
    (data) => mapToCamelCase(data),
    createInsertSchema(agencies).omit({ id: true, createdAt: true, updatedAt: true })
);

export const updateAgencySchema = z.preprocess(
    (data) => mapToCamelCase(data),
    createInsertSchema(agencies).partial().omit({ id: true, createdAt: true, updatedAt: true })
);

export const completeAgencySetupSchema = z.preprocess(
    (data) => mapToCamelCase(data),
    z.object({
        id: z.string().uuid().optional(),
        companyName: z.string().min(1),
        subdomain: z.string().min(1).regex(/^[a-zA-Z0-9-]+$/),
        adminEmail: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        plan: z.enum(['trial', 'starter', 'basic', 'professional', 'enterprise', 'custom']).default('trial'),
        maxUsers: z.number().int().positive().optional(),
        maxStorageGB: z.number().int().positive().optional(),
        metadata: z.record(z.any()).optional(),
        settings: z.record(z.any()).optional(),
        address: z.record(z.any()).optional(),

        // Frontend specific fields that might be passed
        teamMembers: z.array(z.any()).optional(),
        logo: z.string().optional(),
        database: z.string().optional(),
    })
);

export type CreateAgencyInput = z.infer<typeof createAgencySchema>;
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>;
export type CompleteAgencySetupInput = z.infer<typeof completeAgencySetupSchema>;

export const provisionAgencySchema = z.object({
    agencyName: z.string().min(1),
    domain: z.string().min(1),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(8),
    adminName: z.string().optional(),
    subscriptionPlan: z.enum(['trial', 'starter', 'basic', 'professional', 'enterprise', 'custom']).default('trial'),
    companySize: z.string().optional(),
    industry: z.string().optional(),
    primaryFocus: z.string().optional(),
    timezone: z.string().optional(),
    enableGST: z.boolean().optional(),
    country: z.string().optional(),
    id: z.string().optional(),
});
export type ProvisionAgencyInput = z.infer<typeof provisionAgencySchema>;

export const agencyResponseSchema = agencySchema.transform((data) => mapToCamelCase(data));

export const listAgenciesResponseSchema = z.object({
    agencies: z.array(agencyResponseSchema),
});
