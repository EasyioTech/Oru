
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

export const agencyResponseSchema = agencySchema.transform((data) => mapToSnakeCase(data));

export const listAgenciesResponseSchema = z.object({
    agencies: z.array(agencyResponseSchema),
});
