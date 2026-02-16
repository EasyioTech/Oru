
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { systemSettings, agencies } from '../../infrastructure/database/schema.js';
import { mapToCamelCase, mapToSnakeCase } from '../../utils/case-transform.js';

// --- System Settings Schemas ---
export const systemSettingsSchema = createSelectSchema(systemSettings);

// Create the insert schema, but preprocess inputs to transform snake_case to camelCase
const baseUpdateSettingsSchema = createInsertSchema(systemSettings).partial();

export const updateSystemSettingsSchema = z.preprocess(
    (data) => mapToCamelCase(data),
    baseUpdateSettingsSchema
);

// --- Agency Summary Schema ---
// Extend the select schema with additional computed fields
export const agencySummarySchema = createSelectSchema(agencies).pick({
    id: true,
    name: true,
    domain: true,
    subscriptionPlan: true,
    maxUsers: true,
    isActive: true,
    createdAt: true,
}).extend({
    userCount: z.number().default(0),
    projectCount: z.number().default(0),
    invoiceCount: z.number().default(0),
});

// Since agencySummarySchema output keys are camelCase (id, name, domain, subscriptionPlan, ...),
// And frontend expects snake_case (subscription_plan),
// We might need to transform the output too.
// Or we can redefine the output schema to match transformed structure?
// Zod `transform` can map output.
export const agencySummaryResponseSchema = agencySummarySchema.transform((data) => mapToSnakeCase(data));


// --- System Metrics Schema ---
// Metrics schema keys are camelCase in Typescript interface, so match that.
// Frontend SystemMetrics interface uses camelCase keys (totalAgencies, activeAgencies).
// Wait, let's verify frontend structure again.
// Frontend `SystemMetrics` uses camelCase. `AgencySummary` uses snake_case.
export const systemMetricsSchema = z.object({
    totalAgencies: z.number(),
    activeAgencies: z.number(),
    totalUsers: z.number(),
    activeUsers: z.number(),
    subscriptionPlans: z.record(z.string(), z.number()),
    revenueMetrics: z.object({
        mrr: z.number(),
        arr: z.number(),
    }),
    usageStats: z.object({
        totalProjects: z.number(),
        totalInvoices: z.number(),
        totalClients: z.number(),
        totalAttendanceRecords: z.number(),
    }),
    systemHealth: z.object({
        uptime: z.string(),
        responseTime: z.number(),
        errorRate: z.number(),
    }),
});

// --- Response Schemas ---
export const getMetricsResponseSchema = z.object({
    metrics: systemMetricsSchema,
    agencies: z.array(agencySummaryResponseSchema),
});

export const getSettingsResponseSchema = z.object({
    settings: systemSettingsSchema.transform((data) => mapToSnakeCase(data)),
});
