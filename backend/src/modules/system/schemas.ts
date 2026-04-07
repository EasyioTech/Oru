
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { systemSettings, agencies } from '../../infrastructure/database/schema.js';
import { mapToCamelCase, mapToSnakeCase } from '../../utils/case-transform.js';

// --- Email Schema ---
export const emailTestRequestSchema = z.object({
    to: z.string().email(),
});

export const emailTestResponseSchema = z.object({
    messageId: z.string(),
    smtpResponse: z.string(),
});

// --- System Settings Schemas ---
const baseSystemSettingsSchema = createSelectSchema(systemSettings);

// Extend with virtual fields for secrets (masked)
export const systemSettingsSchema = baseSystemSettingsSchema.extend({
    // Virtual fields that frontend expects (will be mapped to snake_case)
    smtpPassword: z.string().optional(),
    sendgridApiKey: z.string().optional(),
    mailgunApiKey: z.string().optional(),
    awsSesAccessKey: z.string().optional(),
    awsSesSecretKey: z.string().optional(),
    resendApiKey: z.string().optional(),
    postmarkApiKey: z.string().optional(),
    captchaSecretKey: z.string().optional(),
    awsS3AccessKeyId: z.string().optional(),
    awsS3SecretAccessKey: z.string().optional(),
    awsS3Endpoint: z.string().nullable().optional(),
    awsS3PublicUrl: z.string().nullable().optional(),
    sentryDsn: z.string().optional(),

    // Virtual fields that frontend expects
    facebookUrl: z.string().nullable().optional(),
    twitterUrl: z.string().nullable().optional(),
    linkedinUrl: z.string().nullable().optional(),
    instagramUrl: z.string().nullable().optional(),
    youtubeUrl: z.string().nullable().optional(),
    termsOfServiceUrl: z.string().nullable().optional(),
    privacyPolicyUrl: z.string().nullable().optional(),
    cookiePolicyUrl: z.string().nullable().optional(),
    metaKeywords: z.string().nullable().optional(),
});

// Create the insert schema, but preprocess inputs to transform snake_case to camelCase
const baseUpdateSettingsSchema = createInsertSchema(systemSettings).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
}).partial();

// Allow virtual fields in update
const updateSettingsWithVirtuals = baseUpdateSettingsSchema.extend({
    smtpPassword: z.string().optional(),
    sendgridApiKey: z.string().optional(),
    mailgunApiKey: z.string().optional(),
    awsSesAccessKey: z.string().optional(),
    awsSesSecretKey: z.string().optional(),
    resendApiKey: z.string().optional(),
    postmarkApiKey: z.string().optional(),
    captchaSecretKey: z.string().optional(),
    awsS3AccessKeyId: z.string().optional(),
    awsS3SecretAccessKey: z.string().optional(),
    awsS3Endpoint: z.string().nullable().optional(),
    awsS3PublicUrl: z.string().nullable().optional(),
    sentryDsn: z.string().optional(),

    // Social & Legal fields (mapped to JSONB in service)
    logoUrl: z.string().nullable().optional(),
    logoLightUrl: z.string().nullable().optional(),
    logoDarkUrl: z.string().nullable().optional(),
    faviconUrl: z.string().nullable().optional(),
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    ogTitle: z.string().nullable().optional(),
    ogDescription: z.string().nullable().optional(),
    facebookUrl: z.string().nullable().optional(),
    twitterUrl: z.string().nullable().optional(),
    linkedinUrl: z.string().nullable().optional(),
    instagramUrl: z.string().nullable().optional(),
    youtubeUrl: z.string().nullable().optional(),
    termsOfServiceUrl: z.string().nullable().optional(),
    privacyPolicyUrl: z.string().nullable().optional(),
    cookiePolicyUrl: z.string().nullable().optional(),
    supportAddress: z.string().nullable().optional(),
    metaKeywords: z.string().nullable().optional(),

    captchaThreshold: z.union([z.string(), z.number()]).transform(String).optional(),
    sentrySampleRate: z.union([z.string(), z.number()]).transform(String).optional(),
    performanceSampleRate: z.union([z.string(), z.number()]).transform(String).optional(),
});

export const updateSystemSettingsSchema = z.preprocess(
    (data) => mapToCamelCase(data),
    updateSettingsWithVirtuals
);

export type UpdateSystemSettingsInput = z.infer<typeof updateSettingsWithVirtuals>;

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

export const getSeoSettingsResponseSchema = z.object({
    meta_title: z.string().nullable(),
    meta_description: z.string().nullable(),
    meta_keywords: z.string().nullable(),
    og_title: z.string().nullable(),
    og_description: z.string().nullable(),
    og_image_url: z.string().nullable(),
    twitter_card_type: z.string().nullable(),
    twitter_site: z.string().nullable(),
    facebook_url: z.string().nullable(),
    twitter_url: z.string().nullable(),
    linkedin_url: z.string().nullable(),
    instagram_url: z.string().nullable(),
    youtube_url: z.string().nullable(),
}).transform((data) => mapToSnakeCase(data));

// --- Feature Schemas ---
export const createFeatureSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    featureKey: z.string().min(1),
    isActive: z.boolean().default(true),
    metadata: z.record(z.any()).default({}),
});

export const updateFeatureSchema = createFeatureSchema.partial();

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;

// --- Tickets Query Schema ---
export const ticketsQuerySchema = z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

export type TicketsQueryInput = z.infer<typeof ticketsQuerySchema>;
