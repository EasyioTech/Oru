
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { pageCatalog, pagePricingTiers, agencyPageAssignments, agencyPageRequests } from '../../infrastructure/database/schema.js';
import { mapToCamelCase, mapToSnakeCase } from '../../utils/case-transform.js';

// Base schema from DB
const basePageCatalogSchema = createSelectSchema(pageCatalog);

export const pageCatalogSchema = basePageCatalogSchema.extend({
    baseCost: z.union([z.string(), z.number()]),
});

export const createPageCatalogSchema = z.preprocess(
    (data: any) => mapToCamelCase(data),
    createInsertSchema(pageCatalog).omit({ id: true, createdAt: true, updatedAt: true })
);

export const updatePageCatalogSchema = z.preprocess(
    (data: any) => mapToCamelCase(data),
    createInsertSchema(pageCatalog).partial().omit({ id: true, createdAt: true, updatedAt: true })
);

export const pagePricingTierSchema = createSelectSchema(pagePricingTiers);
export const agencyPageAssignmentSchema = createSelectSchema(agencyPageAssignments);
export const agencyPageRequestSchema = createSelectSchema(agencyPageRequests);

// Response schemas
export const pageCatalogResponseSchema = pageCatalogSchema.transform(data => mapToSnakeCase(data));
export const listPageCatalogResponseSchema = z.object({
    items: z.array(pageCatalogResponseSchema),
});

export const pageDetailResponseSchema = pageCatalogSchema.extend({
    pricingTiers: z.array(pagePricingTierSchema.transform(data => mapToSnakeCase(data))),
}).transform(data => mapToSnakeCase(data));
