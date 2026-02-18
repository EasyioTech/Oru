
import { z } from 'zod';

export const searchQuerySchema = z.object({
    q: z.string().min(1),
    type: z.enum(['all', 'agencies', 'users', 'tickets', 'pages']).default('all'),
    limit: z.coerce.number().min(1).max(50).default(10),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export const searchResultItemSchema = z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    url: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export const searchResponseSchema = z.object({
    results: z.array(searchResultItemSchema),
});
