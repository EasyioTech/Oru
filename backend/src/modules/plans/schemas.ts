
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { subscriptionPlans } from '../../infrastructure/database/schema.js';
import { mapToCamelCase, mapToSnakeCase } from '../../utils/case-transform.js';

export const planSchema = createSelectSchema(subscriptionPlans);

// Schema for data returned by service (includes computed fields)
const planServiceOutputSchema = planSchema.extend({
    basePriceMonthly: z.union([z.string(), z.number()]), // Service returns number, DB has string
    price: z.number().optional(),
    currency: z.string().optional(),
    interval: z.string().optional(),
    // Features is jsonb, service returns array
    features: z.array(z.any()).optional().default([]),
});

export const createPlanSchema = z.preprocess(
    (data: any) => mapToCamelCase(data),
    createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true, updatedAt: true })
);

export const updatePlanSchema = z.preprocess(
    (data: any) => mapToCamelCase(data),
    createInsertSchema(subscriptionPlans).partial().omit({ id: true, createdAt: true, updatedAt: true })
);

export const planResponseSchema = planServiceOutputSchema.transform(data => mapToSnakeCase(data));

export const listPlansResponseSchema = z.object({
    plans: z.array(planResponseSchema),
});

// Features Schemas
import { systemFeatures } from '../../infrastructure/database/schemas/features.js';

export const featureSchema = createSelectSchema(systemFeatures);

export const createFeatureSchema = z.preprocess(
    (data: any) => mapToCamelCase(data),
    createInsertSchema(systemFeatures).omit({ id: true, createdAt: true, updatedAt: true })
);

export const updateFeatureSchema = z.preprocess(
    (data: any) => mapToCamelCase(data),
    createInsertSchema(systemFeatures).partial().omit({ id: true, createdAt: true, updatedAt: true })
);

export const featureResponseSchema = featureSchema.transform(data => mapToSnakeCase(data));

export const listFeaturesResponseSchema = z.object({
    features: z.array(featureResponseSchema),
});
